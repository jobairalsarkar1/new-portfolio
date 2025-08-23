import { signIn } from "@/auth";
import Image from "next/image";
import React from "react";

export default function SignInWithGithub() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/jas-dashboard" });
      }}
      className="flex-1"
    >
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-white/90 hover:bg-gray-400 text-gray-900 py-2 rounded-md transition duration-200 cursor-pointer"
      >
        {/* <Github className="w-5 h-5" /> */}
        <Image src="/github.png" alt="Google" width={25} height={25} />
        GitHub
      </button>
    </form>
  );
}
