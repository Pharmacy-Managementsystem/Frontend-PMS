import React from "react";

interface ChartIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  variant?: "up" | "down" | "horizontal"; // إضافة نوع جديد
  className?: string;
}

export const ChartIcon: React.FC<ChartIconProps> = ({
  size = 21,
  color = "#2563EB",
  strokeWidth = 2,
  variant = "down", // قيمة افتراضية
  className,
  ...props
}) => {
  const aspectRatio = 20 / 21;
  const height = size * aspectRatio;

  // تعريف جميع الأنواع
  const variants = {
    up: (
      <>
        <path
          d="M13.9404 5.82568H18.9382V10.8234"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.9384 5.82568L11.8583 12.9058L7.6935 8.74102L2.2793 14.1552"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    down: (
      <>
        <path
          d="M14.1406 14.1554H19.1384V9.15771"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.1386 14.1552L12.0585 7.07512L7.8937 11.2399L2.47949 5.82568"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    horizontal: (
      <path
        d="M4.56934 9.99072H16.2307"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {variants[variant]}
    </svg>
  );
};
