"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const LoginForm = ({ setIsLogin }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [loginFormData, setLoginFormData] = useState({ identifier: "", password: "" });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!loginFormData.identifier || !loginFormData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await login({ identifier: loginFormData.identifier, password: loginFormData.password });
      toast.success("Login successful! Redirecting...");
      setTimeout(() => router.push("/inventory"), 1000);
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.message || "Invalid email or password");
    }
  };

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full"
    >
      <div className="text-center md:text-left mb-7">
        <h1 className="text-3xl md:text-[34px] text-neutral-900 mb-1.5" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
          Welcome Back
        </h1>
        <p className="text-neutral-500 text-[13px]">Enter your email and password to access your account</p>
      </div>

      <form onSubmit={handleSubmitLogin} className="space-y-4 px-1">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5 tracking-wide">Email</label>
          <input
            type="text"
            name="identifier"
            value={loginFormData.identifier}
            onChange={handleLoginChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-50/80 border border-neutral-200 text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-600/60 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5 tracking-wide">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={loginFormData.password}
              onChange={handleLoginChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-50/80 border border-neutral-200 text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-600/60 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-700 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[12px] pt-1 px-1">
          <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-neutral-300 text-brand-700 focus:ring-brand-600/40" />
            Remember me
          </label>
          <button type="button" className="text-brand-700 hover:text-brand-800 font-medium">
            Forgot Password
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-[13px] tracking-wide transition-colors shadow-sm shadow-brand-900/20 mt-2"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-[13px] text-neutral-500 mt-7">
        Don&apos;t have an account?{" "}
        <button onClick={() => setIsLogin(false)} className="text-brand-700 font-semibold hover:text-brand-800">
          Sign Up
        </button>
      </p>
    </motion.div>
  );
};

export default LoginForm;
