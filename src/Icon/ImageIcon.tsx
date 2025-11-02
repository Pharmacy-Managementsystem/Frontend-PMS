import React from "react";

interface ImageGalleryIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const ImageIcon: React.FC<ImageGalleryIconProps> = ({
  size = 32,
  color = "#9CA3AF",
  strokeWidth = 1.5, // Default adjusted to match SVG
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M5.33691 21.3363L11.4498 15.2233C11.9498 14.7236 12.6277 14.4428 13.3346 14.4428C14.0415 14.4428 14.7195 14.7236 15.2194 15.2233L21.3324 21.3363M18.6665 18.6704L20.7805 16.5563C21.2805 16.0565 21.9584 15.7758 22.6653 15.7758C23.3722 15.7758 24.0502 16.0565 24.5501 16.5563L26.6642 18.6704M18.6665 10.6726H18.6798M8.00282 26.6681H23.9983C24.7053 26.6681 25.3834 26.3872 25.8834 25.8873C26.3833 25.3873 26.6642 24.7092 26.6642 24.0022V8.00673C26.6642 7.29969 26.3833 6.6216 25.8834 6.12165C25.3834 5.62169 24.7053 5.34082 23.9983 5.34082H8.00282C7.29578 5.34082 6.6177 5.62169 6.11774 6.12165C5.61779 6.6216 5.33691 7.29969 5.33691 8.00673V24.0022C5.33691 24.7092 5.61779 25.3873 6.11774 25.8873C6.6177 26.3872 7.29578 26.6681 8.00282 26.6681Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
