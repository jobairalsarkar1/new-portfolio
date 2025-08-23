"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { close, menu } from "@/public/assets";
import { FiBriefcase } from "react-icons/fi";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];

  const gradientClasses =
    "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600";

  return (
    <header className="header fixed top-0 left-0 right-0 z-50 bg-transparent flex items-center justify-between sm:px-12 px-6 py-4 max-w-6xl mx-auto w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <p
          className={`w-11 h-11 rounded-full ${gradientClasses} flex items-center justify-center shadow-md font-semibold text-white`}
        >
          JAS
        </p>
        <p className="text-sm sm:text-lg font-semibold text-white">
          Jobair &nbsp; | &nbsp; Al Sarkar
        </p>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden sm:flex items-center gap-7">
        <nav className="flex gap-4 xl:gap-6 text-md font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                relative px-1 py-1 transition-all
                ${
                  pathname === link.href
                    ? `text-transparent bg-clip-text font-bold ${gradientClasses} after:w-full`
                    : "text-slate-200"
                }
                after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-sky-500 after:w-0 after:transition-all hover:after:w-full
              `}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Hire Me Button */}
        <Link
          href="/contact"
          className="flex items-center gap-2 text-[0.9rem] font-semibold border border-gray-500 xl:ml-4 px-4 py-2 bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 text-white rounded-lg shadow-md hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 transition-all duration-300"
        >
          <FiBriefcase size={18} />
          Hire Me
        </Link>
      </div>

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
                  ? "text-transparent bg-clip-text font-semibold " +
                    gradientClasses
                  : "text-white hover:text-sky-400"
              }`}
              onClick={() => setToggle(false)}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Hire Me button */}
          <Link
            href="/contact"
            className="flex items-center gap-2 text-white font-semibold border border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            onClick={() => setToggle(false)}
          >
            <FiBriefcase size={18} />
            Hire Me
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
