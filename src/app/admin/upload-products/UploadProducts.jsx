"use client";

import { db } from "@/lib/firebaseConfig";  
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const dummyProducts = [
  {
    id: "PRD-001",
    name: "Anwesha T-Shirt Black",
    img_src: "/store/tshirt-black.jpg",
    type: "merch",
    cost: 499,
    stock: 120,
    active: true,
    description: "Premium cotton T-shirt",
  },
  {
    id: "PRD-002",
    name: "Anwesha Hoodie",
    img_src: "/store/hoodie.jpg",
    type: "merch",
    cost: 899,
    stock: 85,
    active: true,
    description: "Warm fleece hoodie",
  }
];

export default function UploadProducts() {

  const uploadToFirestore = async () => {
    try {
      for (const product of dummyProducts) {
        await setDoc(doc(db, "products", product.id), {
          ...product,
          createdAt: serverTimestamp(),
        });
      }
      
      alert("Products uploaded successfully!");
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Error writing products");
    }
  };

  return (
    <button
      className="bg-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-800"
      onClick={uploadToFirestore}
    >
      Upload Dummy Products
    </button>
  );
}
