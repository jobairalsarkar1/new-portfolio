import React from "react";
import SignInWithGithub from "@/components/auth-buttons/SignInWithGithub";
import SignInWithGoogle from "@/components/auth-buttons/SignInWithGoogle";

const Page = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070d] text-white relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute w-[600px] h-[800px] bg-gradient-to-br from-orange-700/30 to-orange-900/30 rounded-[10%] -top-40 -left-60 rotate-[-20deg] opacity-60"></div>
        <div className="absolute w-[700px] h-[600px] bg-gradient-to-tr from-orange-500/30 to-orange-700/30 rounded-[8%] -top-20 -right-40 rotate-[30deg] opacity-50"></div>
        <div className="absolute w-[400px] h-[500px] bg-gradient-to-b from-orange-400/30 to-orange-600/30 rounded-[12%] bottom-[-150px] left-1/3 rotate-[15deg] opacity-40"></div>
      </div>

      {/* Sign-in Form */}
      <div className="flex flex-1 justify-center items-center z-10 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">
            Sign In / Up
          </h2>

          {/* Social Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SignInWithGoogle />
            <SignInWithGithub />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
