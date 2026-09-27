import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ variant = 'full', className = 'h-8 w-auto' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="yb-icon-title"
        className={className}
      >
        <title id="yb-icon-title">YourBot Icon</title>
        <defs>
          <linearGradient id="yb-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#D946EF" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="34" height="27" rx="10" fill="url(#yb-grad)" />
        <path d="M9 30 L9 36.5 C9 37.3 9.9 37.8 10.6 37.3 L17.5 30 Z" fill="url(#yb-grad)" />
        <path
          d="M13.5 10 L20 17.5 L26.5 10 M20 17.5 L20 24.5"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="17.5" r="2.4" fill="#FFFFFF" />
        <circle cx="13.5" cy="10" r="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <circle cx="26.5" cy="10" r="1.5" fill="#FFFFFF" fillOpacity="0.85" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 176 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="yb-logo-title"
      className={className}
    >
      <title id="yb-logo-title">YourBot Logo</title>
      <defs>
        <linearGradient id="yb-grad-full" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="yb-text-grad" x1="102" y1="10" x2="170" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#E879F9" />
        </linearGradient>
      </defs>
      <g>
        <rect x="3" y="3" width="34" height="27" rx="10" fill="url(#yb-grad-full)" />
        <path d="M9 30 L9 36.5 C9 37.3 9.9 37.8 10.6 37.3 L17.5 30 Z" fill="url(#yb-grad-full)" />
        <path
          d="M13.5 10 L20 17.5 L26.5 10 M20 17.5 L20 24.5"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="17.5" r="2.4" fill="#FFFFFF" />
        <circle cx="13.5" cy="10" r="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <circle cx="26.5" cy="10" r="1.5" fill="#FFFFFF" fillOpacity="0.85" />
      </g>
      <text
        x="50"
        y="27"
        fontFamily="'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        <tspan fill="#F5F3FF">Your</tspan>
        <tspan fill="url(#yb-text-grad)">Bot</tspan>
      </text>
    </svg>
  );
}