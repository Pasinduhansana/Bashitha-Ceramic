"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/wallpapers/login-bg.jpg')" }}>
        <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent"></div>
      </div>

      {/* Logo */}
      <div
        className="absolute w-13 mt-auto ml-auto h-13 bottom-4 right-4 inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/logo.png')" }}
      ></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Mobile Header - Show on Mobile Only */}
          <div className="md:hidden w-full space-y-4 text-center mb-6">
            <h1 className="text-xl font-roboto-condensed font-semibold tracking-tight text-white">BASHITHA CERAMIC</h1>
            <h2 className="text-2xl sm:text-3xl font-roboto-condensed font-bold tracking-tight text-white">FORGOT PASSWORD</h2>
          </div>

          <div className="hidden md:block w-full space-y-6">
            <h1 className="text-base sm:text-lg md:text-2xl font-roboto-condensed font-semibold tracking-tight text-white">BASHITHA CERAMIC</h1>
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-roboto-condensed font-bold tracking-tight text-white leading-tight">
              EXPLORE <br />
              ELEGANCE
            </h1>
            <p className="mt-2 font-roboto-condensed font-semibold text-[18px] text-white">Where Your Dream Designs Come to Life</p>
            <p className="mt-2 font-roboto-condensed font-normal text-[18px] text-white">
              Discover a wide selection of premium tiles and
              <br /> accessories, crafted to transform your space.
            </p>
          </div>

          <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="w-full md:ml-auto"
            >
              <ForgotPasswordForm />
            </motion.div>
          </Suspense>
        </div>
      </div>
    </main>
  );
}
