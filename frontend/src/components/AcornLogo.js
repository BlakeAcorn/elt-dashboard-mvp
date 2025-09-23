import React from 'react';

const AcornLogo = ({ size = 'default', variant = 'horizontal', className = '' }) => {

  const iconSizeClasses = {
    small: 'h-12 w-12',
    default: 'h-18 w-18',
    large: 'h-24 w-24',
    xl: 'h-30 w-30',
    xxl: 'h-36 w-36'
  };

  const LogoIcon = () => (
    <img 
      src="/acorn-logo.svg" 
      alt="Acorn Logo"
      className={`${iconSizeClasses[size]}`}
      style={{ minWidth: '24px', minHeight: '24px' }}
    />
  );

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center space-y-1 ${className}`}>
        <LogoIcon />
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex items-center ${className}`}>
      <LogoIcon />
    </div>
  );
};

export default AcornLogo;
