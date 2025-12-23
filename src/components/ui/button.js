export default function Button({ children, variant = "primary", className = "", disabled = false, ...props }) {
  const baseStyles =
    "inline-flex justify-center h-[40px] items-center focus:outline-none ring-0 rounded-[4px] px-6 py-3 text-sm font-medium uppercase tracking-wide relative overflow-hidden transition-all duration-200";
  const variants = {
    primary:
      "bg-gradient-to-b from-[#29B0B9] to-[#1a92a1] text-white disabled:bg-teal-300 shadow-md before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#34C5CF] before:to-[#1A9BA3] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 transition-colors duration-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 transition-colors duration-500",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
