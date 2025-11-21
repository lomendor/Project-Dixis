"use client";
import React from "react";
import { useCart } from "./CartContext";

export default function CartFab(){
  const { count } = useCart();
  return (
    <button
      aria-label="Καλάθι"
      className="fixed bottom-4 right-4 z-50 rounded-full px-4 py-3 bg-emerald-600 text-white shadow-lg active:scale-95 transition"
      onClick={()=>{ /* future: open drawer */ }}
    >
      Καλάθι <span id="cart-count" className="ml-2 inline-flex min-w-6 justify-center rounded bg-white/20 px-2">{count}</span>
    </button>
  );
}
