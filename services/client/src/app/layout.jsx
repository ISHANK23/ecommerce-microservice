"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Bell, House, ShoppingCart } from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { CartProvider, useCart } from "@/context/CartContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Navigation() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <nav className="flex justify-between items-center py-4 mb-8">
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="logo" width={50} height={50} />
        <Link href="/" className="text-2xl font-black">
          Lama Shop
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          <House className="w-5 h-5" />
        </Link>
        <Bell className="w-5 h-5" />
        <Link href="/cart" className="relative hover:text-gray-600 transition-colors">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <Image
          src="/avatar.png"
          alt="avatar"
          width={32}
          height={32}
          className="rounded-full border border-gray-300"
        />
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-7xl mx-auto px-16 lg:px-0`}
          >
            <Navigation />
            {children}
          </body>
        </CartProvider>
      </QueryClientProvider>
    </html>
  );
}
