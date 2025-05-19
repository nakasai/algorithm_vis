import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'outline' | 'destructive' | 'secondary' | 'default';
  size?: 'sm' | 'default';
}

export function Button({ children, className, ...props }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded font-medium focus:outline-none transition-colors";
  let variantClasses = "bg-blue-500 hover:bg-blue-600 text-white";

  if (props.variant === "outline") {
    variantClasses = "border border-gray-300 hover:bg-gray-100";
  } else if (props.variant === "destructive") {
    variantClasses = "bg-red-500 hover:bg-red-600 text-white";
  } else if (props.variant === "secondary") {
    variantClasses = "bg-gray-200 hover:bg-gray-300 text-gray-800";
  }

  const sizeClasses = props.size === "sm" ? "text-sm px-3 py-1" : "";
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : "";

  const allClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className || ""}`;

  return (
    <button className={allClasses} {...props}>
      {children}
    </button>
  );
}
