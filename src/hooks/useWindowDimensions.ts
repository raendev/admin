import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 800

interface Dimensions {
  width: number
  height: number
  isMobile: boolean
};

function getWindowDimensions(): Dimensions {
  const { innerWidth: width, innerHeight: height } = window;
  const isMobile = width < MOBILE_BREAKPOINT
  return { isMobile, width, height };
}

export default function useWindowDimensions(): Dimensions {
  const [windowDimensions, setWindowDimensions] = useState<Dimensions>(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

