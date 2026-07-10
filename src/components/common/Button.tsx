import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "px-6 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all duration-300 font-poppins flex items-center justify-center gap-2 select-none";
  
  const variants = {
    primary: "bg-[#D4AF37] text-[#090909] hover:bg-[#F3E7C4] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:bg-gray-700 disabled:text-gray-500",
    secondary: "border border-[#D4AF37]/40 bg-transparent text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#F3E7C4] hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:border-gray-800 disabled:text-gray-600",
    emerald: "bg-[#0F6D5B] text-[#F5F5F5] hover:bg-[#148C75] hover:shadow-[0_0_15px_rgba(15,109,91,0.3)] disabled:bg-gray-700 disabled:text-gray-500",
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.99 } : {}}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
