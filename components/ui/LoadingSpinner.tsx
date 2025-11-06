interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white';
  className?: string;
}

const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;