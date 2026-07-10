// app/fonts.js
// Central font config. Import `fraunces.variable` and `inter.variable`
// into the root layout's <html> className, then reference them as
// shown below anywhere text needs the display serif.

import { Fraunces, Inter } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/* ————————————————————————————————————————————————
   app/layout.js

   import { fraunces, inter } from "./fonts";

   export default function RootLayout({ children }) {
     return (
       <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
         <body className="font-sans">{children}</body>
       </html>
     );
   }

   tailwind.config.js — extend the theme so `font-serif` / `font-sans`
   resolve to these instead of the system defaults:

   theme: {
     extend: {
       fontFamily: {
         sans: ["var(--font-inter)", "sans-serif"],
         serif: ["var(--font-fraunces)", "serif"],
       },
     },
   },

   Usage — once the config above is in place, every inline
   `style={{ fontFamily: "'Fraunces', serif" }}` used across the
   redesigned files can be swapped for `className="font-serif italic"`.
   Both work; the className approach avoids relying on the font name
   string matching exactly.
—————————————————————————————————————————————————— */