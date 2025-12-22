"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Button from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook, FaXTwitter } from "react-icons/fa6";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      router.push("/dashboard"); // redirect after success
    } catch (err) {
      // error handled by hook
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 min-w-100">
      <div className="space-y-4 rounded-md ">
        <div>
          <label htmlFor="email" className="block text-md font-normal text-gray-200 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-sm border border-white/20 px-3 py-2 text-md text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-md font-normal text-gray-200 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="block w-full rounded-sm border border-white/20 px-3 py-2 text-md text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
            placeholder="Enter your password"
          />
        </div>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 accent-teal-500 hover:accent-teal-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-md text-gray-200">
            Remember me
          </label>
        </div>

        <div className="text-md">
          <a href="#" className="font-md font-normal text-gray-200 hover:text-gray-100 hover:underline">
            Forgot password ?
          </a>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      {/* OR seperator */}
      <div className="flex items-center gap-4 -mt-1">
        <div className="h-px flex-1 bg-white/30"></div>
        <span className="font-md font-normal text-gray-200 text-center">or</span>
        <div className="h-px flex-1 bg-white/30"></div>
      </div>

      <div className="flex flex-row items-center justify-center gap-5">
        {/* Google Sign-In Button */}
        <a className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200">
          <FcGoogle size={22} />
        </a>
        {/* Apple sign in button */}
        <a className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200">
          <FaApple size={20} className="text-black" />
        </a>
        {/* Facebook sign in button */}
        <a className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200">
          <FaFacebook size={20} className="text-[#1877F2]" />
        </a>
        {/* X sign in button */}
        <a className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200">
          <FaXTwitter size={18} className="text-black" />
        </a>
      </div>

      {/* Register Labels */}
      <div className="flex items-center justify-center space-x-4">
        <div className="text-md">
          <span className="font-md font-normal text-gray-200 ">Don’t have an Account ?</span>
        </div>

        <div className="text-md">
          <a href="/register" className="font-md font-normal text-gray-200 hover:text-gray-100 hover:underline">
            Create an Account
          </a>
        </div>
      </div>
    </form>
  );
}
