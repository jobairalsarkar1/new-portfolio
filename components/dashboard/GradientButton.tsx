import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
};

const GradientButton = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: Props) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg shadow text-white font-semibold bg-gradient-to-r from-gray-900 via-indigo-700 to-gray-800 hover:from-gray-800 hover:via-indigo-900 hover:to-gray-900 disabled:opacity-50 ${className} cursor-pointer`}
    >
      {children}
    </button>
  );
};

export default GradientButton;
