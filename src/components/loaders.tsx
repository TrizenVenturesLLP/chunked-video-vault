
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ContentLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mb-2`} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
