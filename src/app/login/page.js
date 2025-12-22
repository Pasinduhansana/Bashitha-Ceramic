import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Login - Bashitha Ceramics",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/wallpapers/login-bg.jpg')" }}>
        <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent"></div>
      </div>

      {/* Logo */}
      <div
        className="absolute w-13 mt-auto ml-auto h-13 bottom-4 right-4 inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/logo.png')" }}
      ></div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-8 items-center justify-center px-24 absolute inset-0 m-auto w-full">
        <div className="w-full max-w-fit space-y-6 relative z-10 ">
          <h1 className="text-[24px] font-roboto-condensed font-semibold tracking-tight text-white">BASHITHA CERAMIC</h1>
          <h1 className="text-[80px] font-roboto-condensed font-bold tracking-tight text-white">
            EXPLORE <br></br>ELEGANCE
          </h1>
          <p className="mt-2 font-roboto-condensed font-semibold text-[18px] text-white">Where Your Dream Designs Come to Life</p>
          <p className="mt-2 font-roboto-condensed font-normal text-[18px] text-white">
            Discover a wide selection of premium tiles and<br></br> accessories, crafted to transform your space.
          </p>
        </div>
        <div className="w-full max-w-fit space-y-8 ml-auto relative z-10 bg-white/20 backdrop-blur-[50px] p-10 py-8 rounded-md">
          <div className="text-center">
            <h1 className="text-[20px] font-bold tracking-tight text-white">LOGIN</h1>
            <p className="mt-2 text-[15px] text-gray-200">
              Start your experience with our shop by <br></br>signing in or signing up.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
