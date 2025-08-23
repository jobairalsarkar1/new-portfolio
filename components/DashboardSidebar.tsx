"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUsers,
  FaFolder,
  FaFileAlt,
  FaMicrochip,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import clsx from "clsx";
import { useSession, signOut } from "next-auth/react";

export default function DashboardSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    {
      title: "Users",
      icon: <FaUsers size={20} />,
      href: "/jas-dashboard/users",
    },
    {
      title: "Skills",
      icon: <FaMicrochip size={20} />,
      href: "/jas-dashboard/skills",
    },
    {
      title: "Projects",
      icon: <FaFolder size={20} />,
      href: "/jas-dashboard/projects",
    },
    {
      title: "Blogs",
      icon: <FaFileAlt size={20} />,
      href: "/jas-dashboard/blogs",
    },
  ];

  return (
    <aside
      className={clsx(
        "bg-black/40 backdrop-blur-2xl shadow-xl transition-all duration-300 flex flex-col flex-shrink-0 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo + Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg font-semibold text-white">
              JAS
            </div>
            <span className="text-lg font-bold text-white">Dashboard</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
        >
          {collapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col px-4 py-2 space-y-2 mt-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.title}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 relative group",
                "text-gray-300 hover:bg-gray-700 hover:text-white",
                isActive && "bg-blue-900/30 text-white",
                !collapsed ? "justify-start" : "justify-center"
              )}
            >
              <span
                className={clsx(
                  "transition-colors",
                  isActive
                    ? "text-blue-400"
                    : "text-gray-400 group-hover:text-white"
                )}
              >
                {link.icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium">{link.title}</span>
              )}

              {/* Active indicator for collapsed state */}
              {collapsed && isActive && (
                <span className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {session?.user && (
        <div
          className={clsx(
            "p-4 border-t border-gray-700 transition-all duration-300",
            collapsed
              ? "flex flex-col items-center space-y-3"
              : "flex flex-col items-start space-y-3"
          )}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                  {session.user.name?.charAt(0) ||
                    session.user.email?.charAt(0) ||
                    "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
              >
                <FaSignOutAlt size={14} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                {session.user.name?.charAt(0) ||
                  session.user.email?.charAt(0) ||
                  "U"}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center"
                title="Sign Out"
              >
                <FaSignOutAlt size={16} />
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
