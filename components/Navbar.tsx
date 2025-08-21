"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { close, menu } from "@/public/assets";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="header fixed top-0 left-0 right-0 z-50 bg-transparent flex items-center justify-between sm:px-12 px-8 py-4 max-w-6xl mx-auto w-full">
      {/* Logo */}
      <Link
        href="/"
        className="bg-transparent text-slate-200 flex items-center gap-2"
      >
        <p className="text-white w-11 h-11 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md font-semibold">
          JAS
        </p>
        <p className="text-sm sm:text-lg font-semibold">
          Jobair &nbsp; | &nbsp; Al Sarkar
        </p>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden sm:flex gap-7 text-md font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href ? "text-blue-500" : "text-slate-200"
            }
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Nav */}
      <nav className="sm:hidden flex z-50">
        <Image
          src={toggle ? close : menu}
          alt="menu"
          width={32}
          height={32}
          className="cursor-pointer"
          onClick={() => setToggle(!toggle)}
        />
        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-4 black-gradient absolute flex flex-col gap-3 top-16 right-0 mx-4 my-2 min-w-[200px] z-50 rounded-xl`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${
                pathname === link.href
                  ? "text-blue-500 hover:text-violet-500"
                  : "text-white hover:text-violet-500"
              }`}
              onClick={() => setToggle(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
