"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isReset = Boolean(token);

  const onRequest = async (e) => {
    e.preventDefault();
    if (!username) {
      toast.error("Please enter your username");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request reset");
      toast.success("If the username exists, a reset link was sent.");
    } catch (err) {
      toast.error(err.message || "Failed to request reset");
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 justify-center bg-white/15 backdrop-blur-[50px] p-5 sm:p-7 md:p-8 rounded-lg overflow-hidden w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center space-y-1.5">
        <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white">{isReset ? "RESET PASSWORD" : "FORGOT PASSWORD"}</h1>
        {isReset ? (
          <p className="text-xs sm:text-sm md:text-base text-gray-200">Enter a new password to finish resetting your account.</p>
        ) : (
          <p className="text-xs sm:text-sm md:text-base text-gray-200">Enter your username and we'll send a link to reset your password.</p>
        )}
      </div>

      {!isReset ? (
        <form onSubmit={onRequest} className="space-y-4 sm:space-y-5 w-full">
          <div>
            <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-sm border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
              placeholder="Username"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Sending..." : "Send reset link"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-xs sm:text-sm font-medium text-gray-200 hover:text-white hover:underline"
            >
              Back to Sign in
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onReset} className="space-y-4 sm:space-y-5 w-full">
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-sm border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
              placeholder="New password"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="block w-full rounded-sm border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-[#29B0B9] focus:outline-none focus:ring-[0.5px] focus:ring-[#29B0B9]"
              placeholder="Confirm password"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Updating..." : "Reset password"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-md font-normal text-gray-200 hover:text-white hover:underline"
            >
              Back to Sign in
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
