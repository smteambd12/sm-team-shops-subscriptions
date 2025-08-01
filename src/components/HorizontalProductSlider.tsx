
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HorizontalProductSliderProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  isOfferSection?: boolean;
}

const HorizontalProductSlider = ({ children, title, subtitle, icon, isOfferSection = false }: HorizontalProductSliderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className={`font-bold text-gray-900 ${isOfferSection ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`text-gray-600 mt-1 ${isOfferSection ? 'text-sm' : ''}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="rounded-full shadow-md hover:shadow-lg transition-all duration-300 h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="rounded-full shadow-md hover:shadow-lg transition-all duration-300 h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex overflow-x-auto scrollbar-hide pb-2 scroll-smooth ${
            isOfferSection ? 'gap-4' : 'gap-6'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
        <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
      </div>

      {/* Mobile navigation dots */}
      <div className="md:hidden flex justify-center mt-3 gap-2">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-colors ${canScrollLeft ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
          <div className={`w-2 h-2 rounded-full transition-colors ${canScrollRight ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalProductSlider;
