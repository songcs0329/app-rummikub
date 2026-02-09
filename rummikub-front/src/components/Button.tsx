interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'minus' | 'plus';
}

function Button({ variant = 'plus', children, className = '', ...props }: ButtonProps) {
  const variantClasses = variant === 'minus' ? 'bg-red-500' : 'bg-green-500';

  return (
    <button
      className={`flex items-center justify-center w-6 h-6 text-lg text-white ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
