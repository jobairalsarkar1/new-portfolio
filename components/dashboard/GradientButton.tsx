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
      className={`px-4 py-1.5 rounded-lg shadow text-white bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 hover:opacity-90 disabled:opacity-50 ${className} cursor-pointer`}
    >
      {children}
    </button>
  );
};

export default GradientButton;
