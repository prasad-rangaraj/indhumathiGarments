import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, Shield } from 'lucide-react';
import indhumathiLogo from '@/assets/logo-new.png';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';
import bgCotton2 from '@/assets/bg-cotton-2.jpg';
import bgCotton3 from '@/assets/bg-cotton-3.jpg';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100dvh-4rem)] flex items-center px-4 pb-10 sm:py-5 md:py-5 overflow-hidden">
        {/* Rotating Background Images - Fixed */}
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
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
                alt={t('about.title')}
                className="h-32 sm:h-36 md:h-36 lg:h-52 w-auto object-contain animate-fade-in"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground px-4">
              {t('about.title')}
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-3 sm:mb-4 max-w-3xl mx-auto px-4">
              {t('about.subtitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              {t('about.tagline')}
            </p>
            <p className="text-base sm:text-lg text-foreground/80 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              {t('about.heroDesc')}
            </p>
            <Link
              to="/products"
              className="btn-primary inline-flex items-center gap-2 hover-glow animate-zoom-in text-sm sm:text-base"
            >
              {t('about.shopNow')} <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="mx-4 sm:mx-auto">
          {/* Story text */}
          <div className="max-w-3xl mx-auto text-center animate-slide-up mb-10 sm:mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">{t('about.ourStory')}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-base sm:text-lg">
              {t('about.storyP1')}
            </p>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              {t('about.storyP2')}
            </p>
          </div>

          {/* Single-row highlights (stacked on mobile) */}
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-20 sm:gap-6">
              <div className="text-center">
                <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-foreground text-sm sm:text-lg">{t('about.premiumQuality')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('about.pureCotton')}</p>
              </div>
              <div className="text-center">
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-foreground text-sm sm:text-lg">{t('about.madeWithLove')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('about.handcraftedCare')}</p>
              </div>
              <div className="text-center">
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-foreground text-sm sm:text-lg">{t('about.skinSafe')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('about.hypoallergenic')}</p>
              </div>
              <div className="text-center">
                <div className="h-11 w-11 sm:h-12 sm:w-12 text-lg bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-bold text-sm">{t('about.yearsExperience')}</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-lg">{t('about.yearsExperienceTitle')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('about.trustedBrand')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-accent/30 to-secondary/20">
        <div className=" mx-7 sm:mx-16 text-center">
          <h2 className="text-3xl font-bold mb-12 text-foreground">{t('about.whyChooseTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-none mx-auto">
            <div className="card-elegant p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4 text-foreground">{t('about.pureCottonPromise')}</h3>
              <p className="text-muted-foreground">
                {t('about.pureCottonPromiseDesc')}
              </p>
            </div>
            <div className="card-elegant p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4 text-foreground">{t('about.expertCraftsmanship')}</h3>
              <p className="text-muted-foreground">
                {t('about.expertCraftsmanshipDesc')}
              </p>
            </div>
            <div className="card-elegant p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-4 text-foreground">{t('about.affordableLuxury')}</h3>
              <p className="text-muted-foreground">
                {t('about.affordableLuxuryDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
