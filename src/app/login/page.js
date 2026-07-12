"use client";

import { useState } from "react";
import {  AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import login_bg from "../../../public/wallpapers/login-bg.jpg";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {

  const [isLogin, setIsLogin] = useState(true);

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
                <Login setIsLogin={setIsLogin} />
              ) : (
<Register setIsLogin={setIsLogin} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}