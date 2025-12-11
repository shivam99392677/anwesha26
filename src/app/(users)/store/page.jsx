"use client";
import { useAuthUser } from "@/context/AuthUserContext";
import { useProducts } from "@/hooks/useProduct";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";

export default function Store() {
  const { currentUser, loading } = useAuthUser();
  const router = useRouter();
  const { products } = useProducts();

  if (loading) return null;

  if (!currentUser) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen p-10 bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Store</h1>

      <div className="flex flex-wrap gap-6 justify-center">
        {products.map(p => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}
