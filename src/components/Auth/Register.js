"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Register = ({ setIsLogin }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    const firstName = registerFormData.fullName.trim().split(" ")[0];
    if (firstName.length < 3) {
      toast.error("First name must be at least 3 characters");
      return;
    }
    if (registerFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (registerFormData.password !== registerFormData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: registerFormData.fullName.trim(),
          email: registerFormData.email.trim(),
          password: registerFormData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Account created successfully! Please login.");
      setIsLogin(true);
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full"
    >
      <div className="text-center md:text-left mb-6">
        <h1 className="text-3xl md:text-[34px] text-neutral-900 mb-1.5" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
          Create Account
        </h1>
        <p className="text-neutral-500 text-[13px]">Join us to explore handcrafted ceramics made for your home</p>
      </div>

      <form onSubmit={handleSubmitRegister} className="space-y-3.5 mx-1">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5 tracking-wide">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={registerFormData.fullName}
            onChange={handleRegisterChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-50/80 border border-neutral-200 text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-600/60 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5 tracking-wide">Email</label>
          <input
            type="email"
            name="email"
            value={registerFormData.email}
            onChange={handleRegisterChange}
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
              value={registerFormData.password}
              onChange={handleRegisterChange}
              placeholder="Create a password"
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

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5 tracking-wide">Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={registerFormData.confirmPassword}
              onChange={handleRegisterChange}
              placeholder="Confirm your password"
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

        <label className="flex items-start gap-2 text-[12px] text-neutral-600 cursor-pointer pt-1">
          <input type="checkbox" className="w-3.5 h-3.5 mt-0.5 rounded border-neutral-300 text-brand-700 focus:ring-brand-600/40" />I agree to the
          Terms of Service and Privacy Policy
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-[13px] tracking-wide transition-colors shadow-sm shadow-brand-900/20 mt-2 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-[13px] text-neutral-500 mt-5">
        Already have an account?{" "}
        <button onClick={() => setIsLogin(true)} className="text-brand-700 font-semibold hover:text-brand-800">
          Sign In
        </button>
      </p>
    </motion.div>
  );
};

export default Register;
