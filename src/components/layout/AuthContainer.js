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
        <div className="space-y-6 sm:space-y-8 justify-center bg-white/15 backdrop-blur-[50px] p-6 sm:p-8 rounded-md overflow-hidden">
          <div className="text-center ">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">{isLogin ? "LOGIN" : "CREATE ACCOUNT"}</h1>

            {isLogin ? (
              <p className="mt-2 text-sm sm:text-base text-gray-200 text-center whitespace-pre-line">
                Start your experience with our shop
                <br />
                by signing in or signing up.
              </p>
            ) : (
              <p className="mt-1 text-sm sm:text-base text-gray-200 text-center whitespace-pre-line">
                Create your account to get started
                <br />
                with Bashitha Ceramics.
              </p>
            )}
          </div>

          {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <RegisterForm setIsLogin={setIsLogin} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
