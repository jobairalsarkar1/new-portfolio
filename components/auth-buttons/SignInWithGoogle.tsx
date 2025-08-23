import { signIn } from "@/auth";
import Image from "next/image";
import React from "react";

export default function SignInWithGoogle() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/jas-dashboard" });
      }}
      className="flex-1"
    >
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-[#201d1d] hover:bg-black text-white py-2 rounded-md transition duration-200 cursor-pointer"
      >
        <Image src="/google.png" alt="Google" width={20} height={20} />
        Google
      </button>
    </form>
  );
}
