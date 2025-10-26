// TrafficLight 컴포넌트에 size prop 지원 추가 예시
import React from "react";

export default function TrafficLight({ color, size = "normal", onClick }) {
  const sizeClasses = {
    small: "w-4 h-4",
    normal: "w-6 h-6",
    large: "w-8 h-8",
  };

  const colorClasses = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    gray: "bg-gray-400",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        rounded-full 
        ${onClick ? "cursor-pointer hover:opacity-80" : ""}
        transition-all duration-200
      `}
      onClick={onClick}
    />
  );
}
