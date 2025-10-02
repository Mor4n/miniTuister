import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // Crear un objeto Image para precargar
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setIsError(false);
    };
    
    img.onerror = () => {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      setIsError(true);
    };
    
    // Iniciar la carga
    img.src = src;
    
    return () => {
      // Cleanup
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse rounded-full ${className}`} />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy" // Lazy loading nativo
        {...props}
      />
      {isError && !isLoading && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
          !
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;