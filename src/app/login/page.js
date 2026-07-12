"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import login_bg from "../../../public/wallpapers/login-bg.jpg";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loginFormData, setLoginFormData] = useState({ identifier: "", password: "" });
  const [registerFormData, setRegisterFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4 font-sans overflow-hidden">
      <Image src={login_bg.src} alt="Handcrafted ceramics" className="absolute inset-0 w-full h-full object-fill blur-xl" fill />

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Image / Brand Side */}
        <div
          className={`relative hidden md:flex flex-col justify-between p-10 h-150 transition-all mx-0.5 my-1 rounded-[22px] overflow-hidden duration-700 ${isLogin ? "order-1" : "order-2"}`}
        >
          <Image src={login_bg.src} alt="Handcrafted ceramics" className="absolute inset-0 w-full h-full object-cover" fill />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/50" />

          <div className="relative z-10 flex items-center gap-3">
            <span className="text-[14px] font-semibold tracking-[0.4em] text-brand-200/70 uppercase" style={{ fontFamily: "'Fraunces', serif" }}>
              Bashitha Ceramics
            </span>
            <span className="flex-1 h-px bg-brand-200/40" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-[42px] text-white leading-[1.15] mb-5 italic" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              Shape Your
              <br />
              Everyday
              <br />
              Rituals
            </h2>
            <p className="text-white/60 text-[13px] max-w-xs tracking-wide leading-relaxed">
              Discover handmade ceramic pieces that bring warmth, texture, and story to your home.
            </p>
          </div>
        </div>

        {/* Form Side */}
        <div className={`relative flex flex-col px-8 py-0 md:px-12 h-[600px] overflow-hidden ${isLogin ? "order-2" : "order-1"}`}>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isLogin ? (
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
              ) : (
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
                      <input type="checkbox" className="w-3.5 h-3.5 mt-0.5 rounded border-neutral-300 text-brand-700 focus:ring-brand-600/40" />
                      I agree to the Terms of Service and Privacy Policy
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
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}