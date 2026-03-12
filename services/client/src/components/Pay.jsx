"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { LaptopMinimalCheck, Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const Pay = ({ cart }) => {
  const { clearCart } = useCart();
  const total = cart
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const { isPending, isError, mutate, data, reset } = useMutation({
    mutationFn: async (cart) => {
      const startTime = Date.now();
      const response = await axios.post(
        "http://localhost:8000/payment-service",
        { cart }
      );
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      return { ...response, duration };
    },
    onSuccess: () => {
      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
        reset();
      }, 3000);
    },
  });

  return (
    <div className="bg-red-50 flex flex-col items-center justify-center gap-4 py-8 rounded-xl sticky top-4">
      <div className="flex flex-col gap-12 w-full px-6">
        <div className="">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h1 className="font-thin tracking-wider">CART TOTAL</h1>
            <h2 className="text-xl font-bold tracking-widest">${total}</h2>
          </div>
          <p className="text-xs text-gray-500">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Shipping & taxes calculated at checkout
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4"
              defaultChecked={true}
            />
            <label htmlFor="terms">
              I agree to the{" "}
              <span className="text-red-300">Terms and Conditions</span>
            </label>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-semibold text-sm">Saved Card:</span>
            <Image src="/visa.png" alt="card" width={30} height={20} />
            <span className="font-semibold text-xs">**** 3567</span>
            <span className="text-xs text-red-300 cursor-pointer hover:underline">
              (change)
            </span>
          </div>
        </div>
        <button
          disabled={isPending || cart.length === 0}
          className="bg-black px-5 py-3 text-white rounded-full flex items-center justify-center gap-4 w-full cursor-pointer hover:bg-gray-700 transition-all duration-300 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={() => mutate(cart)}
        >
          <span className="tracking-wider text-sm">CHECKOUT</span>
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
        </button>
        {data && (
          <div className="text-green-600 text-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LaptopMinimalCheck className="w-5 h-5" />
              <span className="font-semibold">Payment Successful!</span>
            </div>
            <span className="text-xs">
              Processed in{" "}
              <span
                className={`font-bold ${data?.duration > 5 ? "text-red-500" : "text-green-600"
                  }`}
              >
                {data?.duration}
              </span>{" "}
              seconds
            </span>
            <span className="text-xs text-gray-600">
              Redirecting and clearing cart...
            </span>
          </div>
        )}
        {isError && (
          <div className="text-red-500 text-sm">
            <p className="font-semibold">Payment failed!</p>
            <p className="text-xs">Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pay;
