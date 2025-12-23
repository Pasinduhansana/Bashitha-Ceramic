"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "@/components/forms/LoginForm";
import RegisterForm from "@/components/forms/RegisterForm";

const cardVariants = {
  initial: { opacity: 0, y: 80 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    y: -80,
    transition: { duration: 0.35, ease: "easeInOut" },
  },
};

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLogin ? "login" : "register"}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md mx-auto md:mx-0 md:ml-auto"
      >
        <div className="space-y-4 sm:space-y-6 justify-center bg-white/15 backdrop-blur-[50px] p-5 sm:p-7 md:p-8 rounded-lg overflow-hidden">
          <div className="text-center space-y-1.5">
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white">{isLogin ? "LOGIN" : "CREATE ACCOUNT"}</h1>

            {isLogin ? (
              <p className="text-xs sm:text-sm md:text-base text-gray-200">
                Start your experience with our shop by signing in or signing up.
              </p>
            ) : (
              <p className="text-xs sm:text-sm md:text-base text-gray-200">
                Create your account to get started with Bashitha Ceramics.
              </p>
            )}
          </div>

          {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <RegisterForm setIsLogin={setIsLogin} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
