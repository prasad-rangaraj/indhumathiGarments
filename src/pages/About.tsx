import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, Shield } from 'lucide-react';
import indhumathiLogo from '@/assets/logo-new.png';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';
import bgCotton2 from '@/assets/bg-cotton-2.jpg';
import bgCotton3 from '@/assets/bg-cotton-3.jpg';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center px-4 pt-4 pb-10 sm:py-12 md:py-16 overflow-hidden">
        {/* Rotating Background Images - Fixed */}
        <div className="fixed top-0 left-0 w-full h-screen h-[100dvh] -z-10 pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-slide-1"
            style={{ backgroundImage: `url(${bgCotton1})` }}
          />
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-slide-2"
            style={{ backgroundImage: `url(${bgCotton2})` }}
          />
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-slide-3"
            style={{ backgroundImage: `url(${bgCotton3})` }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/80" />
        </div>
        
          <div className="container mx-auto text-center relative z-10 px-4 sm:px-6">
          <div className="text-animate">
            <div className="flex justify-center mb-3 sm:mb-6">
              <img 
                src={indhumathiLogo} 
                alt="Indhumathi" 
                className="h-32 sm:h-36 md:h-36 lg:h-52 w-auto object-contain animate-fade-in"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground px-4">
              Premium Cotton Women's Lingerie
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Manufacturing high quality pure cotton women inners
            </p>
            <p className="text-base sm:text-lg text-foreground/80 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              For over two decades, we've been dedicated to creating the finest cotton lingerie 
              that combines comfort, quality, and elegance. Every piece is crafted with love 
              and attention to detail.
            </p>
            <Link 
              to="/products" 
              className="btn-primary inline-flex items-center gap-2 hover-glow animate-zoom-in text-sm sm:text-base"
            >
              Shop Now <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto">
          {/* Story text */}
          <div className="max-w-3xl mx-auto text-center animate-slide-up mb-10 sm:mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Our Story</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-base sm:text-lg">
              Founded in 2001, Indhumathi began as a small family business with a simple mission: 
              to provide women with the most comfortable, high-quality cotton undergarments. 
              What started in a small workshop has grown into a trusted brand known for our 
              commitment to natural fabrics and superior craftsmanship.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              We believe that comfort should never be compromised. That's why we source only 
              the finest cotton fibers and employ traditional techniques alongside modern 
              innovation to create lingerie that feels as good as it looks.
            </p>
          </div>

          {/* Single-row highlights (stacked on mobile) */}
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
              <div className="text-center">
                <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-foreground text-md sm:text-lg">Premium Quality</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">100% Pure Cotton</p>
              </div>
              <div className="text-center">
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-foreground text-md sm:text-lg">Made with Love</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Handcrafted Care</p>
              </div>
              <div className="text-center">
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-foreground text-sm sm:text-lg">Skin Safe</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Hypoallergenic</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 text-lg bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-bold text-sm">20 +</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-lg">Years Experience</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Trusted Brand</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-r from-accent/30 to-secondary/20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Why Choose Indhumathi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-none mx-auto">
            <div className="card-elegant p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Pure Cotton Promise</h3>
              <p className="text-muted-foreground">
                We use only 100% pure cotton, ensuring breathability, softness, and comfort 
                for sensitive skin. No synthetic blends, no compromises.
              </p>
            </div>
            <div className="card-elegant p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Expert Craftsmanship</h3>
              <p className="text-muted-foreground">
                Each piece is carefully crafted by skilled artisans who understand the 
                importance of fit, comfort, and durability in intimate wear.
              </p>
            </div>
            <div className="card-elegant p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Affordable Luxury</h3>
              <p className="text-muted-foreground">
                We believe every woman deserves quality lingerie. Our direct-to-consumer 
                model ensures premium products at accessible prices.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
