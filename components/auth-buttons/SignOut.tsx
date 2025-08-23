import { signOut } from "@/auth";
import { LogOut } from "lucide-react";
import React from "react";

export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 bg-[#171515] hover:bg-black text-white py-2 rounded-md transition duration-200"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </form>
  );
}
