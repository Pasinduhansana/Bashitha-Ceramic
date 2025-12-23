"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import Button from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function RegisterForm({ setIsLogin }) {
  const router = useRouter();
  const { error } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      const result = await signIn("google", { redirect: false });
      if (result?.error) {
        toast.error(result.error || "Google sign-up failed");
      } else if (result?.ok) {
        toast.success("Google sign-up successful! Redirecting...");
        router.push("/inventory");
      }
    } catch (err) {
      console.error("Google sign-up error:", err);
      toast.error("Google sign-up failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOtherProviders = () => {
    toast.error("Please use Google sign-up for authentication");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const firstName = formData.fullName.trim().split(" ")[0];
    if (firstName.length < 3) {
      toast.error("First name must be at least 3 characters");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

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
    <form onSubmit={handleSubmit} className="mt-2 sm:mt-0 space-y-3 sm:space-y-4 w-full max-h-130">
      <div className="space-y-2.5 sm:space-y-3 rounded-md frosted-scroll pr-2 max-h-130 overflow-y-auto">
        <div>
          <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="block w-full rounded-sm border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
            placeholder="Full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5">
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
            className="block w-full rounded-sm border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
            placeholder="Email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-sm border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
              placeholder="Password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-200 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full rounded-sm border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
              placeholder="Confirm password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-200 hover:text-white"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 accent-teal-500 hover:accent-teal-500"
          required
        />
        <label htmlFor="terms" className="ml-2 block text-xs sm:text-sm text-gray-200">
          I agree to the terms and conditions
        </label>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Creating account..." : "Sign up"}
      </Button>

      {/* OR seperator */}
      {/* <div className="flex items-center gap-3 sm:gap-4">
        <div className="h-px flex-1 bg-white/30"></div>
        <span className="text-xs sm:text-sm font-normal text-gray-200 text-center">or</span>
        <div className="h-px flex-1 bg-white/30"></div>
      </div> */}

      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="flex w-full justify-center text-center items-center h-10 gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-white/40 backdrop-blur-md rounded-sm cursor-pointer hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FcGoogle size={18} className="sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm font-medium text-gray-900">{googleLoading ? "Signing up..." : "Sign up using Google"}</span>
      </button>

      {/* Already have account */}
      <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 text-center">
        <span className="text-xs sm:text-sm font-normal text-gray-200">Already have an account?</span>
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className="text-xs sm:text-sm font-medium text-gray-200 hover:text-white hover:underline"
        >
          Login to your account
        </button>
      </div>
    </form>
  );
}
