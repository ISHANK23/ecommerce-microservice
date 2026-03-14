"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Pay from "@/components/Pay";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="mb-16">
                <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl">
                    <div className="text-gray-400 mb-4">
                        <svg
                            className="w-24 h-24"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Add some products to get started!
                    </p>
                    <Link
                        href="/"
                        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-16">
            <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
            <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* Cart Items */}
                <div className="flex flex-col gap-6 w-full lg:w-2/3">
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                        >
                            <div className="relative w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="128px"
                                />
                            </div>
                            <div className="flex flex-col flex-1 gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">{item.name}</h3>
                                        <p className="text-xs text-red-500 font-semibold uppercase">
                                            {item.category}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                                        title="Remove from cart"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.id, item.quantity - 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-lg font-semibold w-8 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.id, item.quantity + 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-800">
                                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ${parseFloat(item.price).toFixed(2)} each
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkout Section */}
                <div className="w-full lg:w-1/3">
                    <Pay cart={cart} />
                </div>
            </div>
        </div>
    );
};

export default CartPage;
