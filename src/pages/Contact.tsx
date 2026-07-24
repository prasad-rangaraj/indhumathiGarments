import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enquiryAPI } from '@/lib/api';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const Contact = () => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await enquiryAPI.create(formData);
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast({ title: "Error", description: "Could not send your message. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 sm:px-6 relative z-10 ">
        <div className="mx-5 sm:mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('contact.title')}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="card-elegant p-6 sm:p-8 animate-slide-up">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">{t('contact.sendMessage')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.phone')} <span className="text-muted-foreground text-xs">{t('contact.phoneOptional')}</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder={t('contact.phonePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.subject')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder={t('contact.subjectPlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder={t('contact.messagePlaceholder')}
                />
              </div>
              
              <button type="submit" disabled={submitting} className="btn-primary w-full hover-glow disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? t('contact.submitting') : t('contact.submit')}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-slide-up">
            <div className="card-elegant p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('contact.emailTitle')}</h3>
                  <p className="text-muted-foreground">{settings.email}</p>
                </div>
              </div>
            </div>

            <div className="card-elegant p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('contact.phoneTitle')}</h3>
                  <p className="text-muted-foreground">{settings.phone}</p>
                </div>
              </div>
            </div>

            <div className="card-elegant p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('contact.addressTitle')}</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{settings.address}</p>
                </div>
              </div>
            </div>

            <div className="card-elegant p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('contact.hoursTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('contact.monSat')}: 9:00 AM - 6:00 PM<br />
                    {t('contact.sunday')}: {t('contact.closed')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Contact;
