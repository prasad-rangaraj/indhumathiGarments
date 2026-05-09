import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-screen h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 relative z-10">
        <div className="text-center card-elegant px-6 sm:px-8 py-8 sm:py-10 max-w-md w-full">
          <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">404</h1>
          <p className="mb-6 sm:mb-8 text-lg sm:text-xl text-muted-foreground">Oops! Page not found</p>
          <a href="/" className="btn-primary text-sm sm:text-base">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
