import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ImageInfo } from '../types';

interface ImageCarouselModalProps {
  show: boolean;
  onHide: () => void;
  images: ImageInfo[];
}

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75" />
    </svg>
);


const ImageCarouselModal: React.FC<ImageCarouselModalProps> = ({ show, onHide, images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const pinchStateRef = useRef({ initialDistance: 0, initialScale: 1 });

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const goToNext = useCallback(() => {
    resetZoom();
    setIsImageLoading(true);
    setActiveIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length, resetZoom]);

  const goToPrev = useCallback(() => {
    resetZoom();
    setIsImageLoading(true);
    setActiveIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length, resetZoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!show) return;
      if (e.key === 'Escape') onHide();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onHide, goToNext, goToPrev]);

  useEffect(() => {
    if (show) {
      setActiveIndex(0);
      setIsImageLoading(true);
      resetZoom();
    }
  }, [show, resetZoom]);
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = 0.1;
    const newScale = e.deltaY < 0 ? scale + scaleAmount : scale - scaleAmount;
    const clampedScale = Math.min(Math.max(1, newScale), 5); // Clamp between 1x and 5x
    
    setScale(clampedScale);
    if (clampedScale <= 1) resetZoom();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) setIsDragging(false);
  };
  
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      pinchStateRef.current = { initialDistance: distance, initialScale: scale };
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      if (pinchStateRef.current.initialDistance === 0) return;
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const newScale = (newDistance / pinchStateRef.current.initialDistance) * pinchStateRef.current.initialScale;
      setScale(Math.min(Math.max(1, newScale), 5));
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchStateRef.current.initialDistance = 0;
    if (scale <= 1) resetZoom();
  };


  if (!show) return null;

  const activeImage = images[activeIndex];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300 ease-in-out"
      onClick={onHide}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl m-4 w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onHide}
          className="absolute -top-4 -right-4 z-30 bg-white dark:bg-gray-700 rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="relative p-4 flex-grow flex items-center justify-center overflow-hidden">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                </svg>
            </div>
          )}
          
          {scale > 1 && (
            <button
                onClick={resetZoom}
                className="absolute top-2 right-2 z-20 bg-white/70 dark:bg-black/70 rounded-full p-2 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Reset zoom"
            >
                <ArrowPathIcon className="h-6 w-6" />
            </button>
          )}

          <div
            className="w-full h-full flex items-center justify-center"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
                src={activeImage.url}
                alt={`Uploaded by ${activeImage.uploadedBy}`}
                draggable="false"
                className={`transition-opacity duration-300 ease-in-out max-h-full max-w-full object-contain ${isImageLoading ? 'opacity-0' : 'opacity-100'} ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    touchAction: 'none',
                    willChange: 'transform',
                }}
                onLoad={() => setIsImageLoading(false)}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="font-semibold text-lg text-gray-800 dark:text-white">{`Uploaded by: ${activeImage.uploadedBy}`}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{`Date: ${activeImage.uploadDate}`}</p>
        </div>

        <button
          onClick={goToPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 m-2 bg-white/70 dark:bg-black/70 rounded-full p-2 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 m-2 bg-white/70 dark:bg-black/70 rounded-full p-2 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
          aria-label="Next image"
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ImageCarouselModal;
