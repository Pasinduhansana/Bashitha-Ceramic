"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import Button from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF, FaXTwitter } from "react-icons/fa6";

export default function LoginForm({ setIsLogin }) {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.identifier || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login({ identifier: formData.identifier, password: formData.password });
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/inventory");
      }, 1000);
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.message || "Invalid email or password");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const result = await signIn("google", { redirect: false });
      if (result?.error) {
        toast.error(result.error || "Google sign-in failed");
      } else if (result?.ok) {
        toast.success("Google sign-in successful! Redirecting...");
        router.push("/inventory");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      toast.error("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOtherProviders = () => {
    toast.error("Please use Google sign-in for authentication");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 w-full">
      <div className="space-y-4 rounded-md ">
        <div>
          <label htmlFor="identifier" className="block text-md font-normal text-gray-200 mb-1">
            Username or Email
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={formData.identifier}
            onChange={handleChange}
            className="block w-full rounded-sm border border-white/20 px-3 py-2 text-md text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
            placeholder="Enter your username or email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-md font-normal text-gray-200 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-sm border border-white/20 px-3 py-2 text-md text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute select-none inset-y-0 right-3 flex items-center text-gray-200 hover:text-white"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
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
          <a href="/forgot-password" className="font-md font-normal text-gray-200 hover:text-white hover:underline">
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
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Sign in with Google"
        >
          <FcGoogle size={22} />
        </button>
        {/* Apple sign in button */}
        <button
          type="button"
          onClick={handleOtherProviders}
          className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200"
          aria-label="Sign in with Apple"
        >
          <FaApple size={22} className="text-black" />
        </button>
        {/* Facebook sign in button */}
        <button
          type="button"
          onClick={handleOtherProviders}
          className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200"
          aria-label="Sign in with Facebook"
        >
          <FaFacebookF size={20} className="text-[#1877F2]" />
        </button>
        {/* X sign in button */}
        <button
          type="button"
          onClick={handleOtherProviders}
          className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-200"
          aria-label="Sign in with X"
        >
          <FaXTwitter size={20} className="text-black" />
        </button>
      </div>

      {/* Register Labels */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-md font-normal text-gray-200">Don't have an Account?</span>
        <button type="button" onClick={() => setIsLogin(false)} className="text-md font-normal text-gray-200 hover:text-white hover:underline">
          Create an Account
        </button>
      </div>
    </form>
  );
}
