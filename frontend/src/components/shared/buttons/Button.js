import React from 'react';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    className = '',
    icon
}) => {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    };

    const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            type={type}
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-md
                font-medium
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-blue-500
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${className}
                flex
                items-center
                justify-center
                gap-2
            `}
            disabled={disabled}
            onClick={onClick}
        >
            {icon && <span className="w-5 h-5">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;