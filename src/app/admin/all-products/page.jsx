"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig'; 
import Link from 'next/link';

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 1. Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        // Map data to match your schema (name, cost, stock, img_src)
        const productList = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setProducts(productList);
      } catch (error) { 
        console.error("Error fetching products:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchProducts();
  }, []);

  // 2. Delete Function
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this product? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(p => p.id !== id));
        if(selectedProduct?.id === id) setSelectedProduct(null);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  // Badge Logic for Product Type/Stock
  const getStockBadge = (stock) => {
    if (stock > 50) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
    if (stock > 0) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
    return "bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-violet-500 selection:text-white pb-20">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-slate-900 py-20 px-6 sm:px-12 mb-12 border-b border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-white animate-gradient">
            MERCH<span className="text-white">STORE</span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg max-w-xl leading-relaxed">
            Manage inventory. Track stock. The official Anwesha merchandise hub.
          </p>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Render Existing Products */}
        {products.map((product) => (
          <div 
            key={product.id} 
            onClick={() => setSelectedProduct(product)}
            className="group relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer"
          >
            {/* Image Container */}
            <div className="h-64 overflow-hidden relative bg-slate-800">
              <img 
                src={product.img_src || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop"} 
                alt={product.name} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border bg-slate-950/50 backdrop-blur border-white/20 text-white">
                    {product.type || "Merch"}
                 </span>
              </div>

              {/* Stock Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${getStockBadge(product.stock)}`}>
                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">{product.name}</h3>
                <span className="text-xl font-bold text-emerald-400">₹{product.cost}</span>
              </div>
              
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">
                {product.description || "Premium quality merchandise."}
              </p>

              <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                        {product.active ? 'Active' : 'Hidden'}
                    </span>
                </div>
                
                <button 
                  onClick={(e) => handleDelete(e, product.id)}
                  className="text-slate-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/5 group-hover:opacity-100 opacity-0 group-hover:translate-x-0 translate-x-4 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* --- ADD PRODUCT CARD --- */}
        <Link 
            href="/admin/upload-products"
            className="group relative h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer"
        >
            <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <svg className="w-10 h-10 text-blue-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Add New Product</h3>
            <p className="text-sm text-slate-400 text-center max-w-[200px]">Add T-shirts, hoodies, or accessories to the store</p>
        </Link>

      </div>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          
          <div className="relative bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300 scrollbar-hide">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-red-500 transition-all backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <div className="grid md:grid-cols-2">
              {/* Left: Image */}
              <div className="relative h-64 md:h-auto min-h-[400px] bg-slate-800">
                <img src={selectedProduct.img_src} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r" />
                <div className="absolute bottom-6 left-6 right-6">
                   <h2 className="text-3xl font-black text-white leading-tight mb-2">{selectedProduct.name}</h2>
                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStockBadge(selectedProduct.stock)}`}>
                      {selectedProduct.stock} Units Remaining
                   </span>
                </div>
              </div>

              {/* Right: Info */}
              <div className="p-8 space-y-6 flex flex-col justify-center">
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Description</h3>
                    <p className="text-slate-300 text-lg leading-relaxed">{selectedProduct.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/10">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Product ID</span>
                    <span className="text-slate-200 font-mono text-sm">{selectedProduct.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Status</span>
                    <span className={`font-bold ${selectedProduct.active ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedProduct.active ? 'Active & Visible' : 'Hidden from Store'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="block text-sm text-slate-500 uppercase tracking-widest">Price</span>
                    <span className="text-4xl font-bold text-emerald-400">₹{selectedProduct.cost}</span>
                  </div>
                  <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-blue-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}