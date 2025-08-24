import React from "react";

const ActionLoader = ({
  size = 6,
  color = "white",
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`border-2 border-${color} border-t-transparent rounded-full animate-spin`}
        style={{ width: size * 4, height: size * 4 }}
      ></div>
    </div>
  );
};

export default ActionLoader;
