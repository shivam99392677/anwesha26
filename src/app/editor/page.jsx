"use client";
import DecodeQR from "./DecodeQR"
export default function EditorPage() {
  return (
    <>
    {/* <div className="h-96 text-black border border-red-700 p-6 bg-white flex items-center justify-center text-2xl font-bold">
      Welcome Editor — You're authorized 🚀
    </div> */}
    <DecodeQR/>
    </>
  );
}
