"use client";

import { Plus } from "lucide-react";
import Image from "next/image";

import { useCart } from "@/context/CartContext";

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
            <div className="relative h-64 bg-gray-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className="p-4">
                <div className="mb-2">
                    <span className="text-xs font-semibold text-red-500 uppercase">
                        {product.category}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {product.description}
                </p>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">
                            ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.stock > 0 && product.stock < 10 && (
                            <p className="text-xs text-orange-500 mt-1">
                                Only {product.stock} left!
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add</span>
                    </button>
                </div>
                {product.stock === 0 && (
                    <p className="text-red-500 text-sm mt-2 font-semibold">Out of Stock</p>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
