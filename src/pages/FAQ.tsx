import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

const faqs = (settings: any, t: any) => [
  {
    category: t('faq.cat1', 'Orders & Shipping'),
    questions: [
      {
        q: t('faq.q1_1', 'How long does shipping take?'),
        a: t('faq.a1_1', 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for select locations.')
      },
      {
        q: t('faq.q1_2', 'What are the shipping charges?'),
        a: t('faq.a1_2', 'We offer free shipping on all orders above ₹500. For orders below ₹500, a nominal shipping charge of ₹50 applies.')
      },
      {
        q: t('faq.q1_3', 'Can I track my order?'),
        a: t('faq.a1_3', 'Yes! You can easily track your order status by logging into your account, navigating to your Profile, and checking the "My Orders" tab. You will also receive email updates as your order progresses.')
      },
      {
        q: t('faq.q1_4', 'Do you ship internationally?'),
        a: t('faq.a1_4', 'Currently, we only ship within India. We are working on expanding our shipping to international locations soon.')
      }
    ]
  },
  {
    category: t('faq.cat2', 'Returns & Exchanges'),
    questions: [
      {
        q: t('faq.q2_1', 'What is your return policy?'),
        a: t('faq.a2_1', 'We offer a 7-day easy return policy from the date of delivery. Products must be unused, with tags attached and in original packaging. For hygiene reasons, worn or washed innerwear cannot be accepted for return.')
      },
      {
        q: t('faq.q2_2', 'How do I initiate a return?'),
        a: t('faq.a2_2', 'Contact our support team with your Order ID and product details. You can reach us at {{email}} or call {{phone}}.', { email: settings.email, phone: settings.phone })
      },
      {
        q: t('faq.q2_3', 'Will I get a full refund?'),
        a: t('faq.a2_3', 'Yes, you will receive a full refund for eligible returns. The refund will be processed to your original payment method within 5-7 business days after we receive the returned product.')
      },
      {
        q: t('faq.q2_4', 'Can I exchange a product for a different size?'),
        a: t('faq.a2_4', 'Yes, you can exchange for a different size within 7 days of delivery, subject to availability. Please contact our support team to initiate an exchange.')
      }
    ]
  },
  {
    category: t('faq.cat3', 'Products'),
    questions: [
      {
        q: t('faq.q3_1', 'What material are your products made of?'),
        a: t('faq.a3_1', 'Our signature garments, including our innerwear and trackpants, are crafted from high-quality, breathable cotton blends to ensure maximum comfort and durability for everyday wear.')
      },
      {
        q: t('faq.q3_2', 'How do I know my correct size?'),
        a: t('faq.a3_2', 'We provide a detailed size guide on each product page. You can also contact our customer support for personalized size recommendations.')
      },
      {
        q: t('faq.q3_3', 'Do you offer products for both men and women?'),
        a: t('faq.a3_3', 'Yes! We have dedicated collections tailored for both men and women, featuring comfortable innerwear, t-shirts, and trackpants.')
      },
      {
        q: t('faq.q3_4', 'How should I wash and care for the garments?'),
        a: t('faq.a3_4', 'For best results, machine wash in cold water with similar colors. Do not bleach. Tumble dry on low or dry in the shade to maintain the fabric\'s softness.')
      }
    ]
  },
  {
    category: t('faq.cat4', 'Payment & Security'),
    questions: [
      {
        q: t('faq.q4_1', 'What payment methods do you accept?'),
        a: t('faq.a4_1', 'We accept UPI, Credit/Debit Cards, and Cash on Delivery (COD). All online payments are secured through our payment gateway partners.')
      },
      {
        q: t('faq.q4_2', 'Is my payment information secure?'),
        a: t('faq.a4_2', 'Yes, we use industry-standard encryption and secure payment gateways. We do not store your card details on our servers.')
      },
      {
        q: t('faq.q4_3', 'Do you offer Cash on Delivery?'),
        a: t('faq.a4_3', 'Yes, Cash on Delivery is available for all orders. A small COD charge may apply for orders below ₹500.')
      }
    ]
  },
  {
    category: t('faq.cat5', 'Account & Support'),
    questions: [
      {
        q: t('faq.q5_1', 'How do I create an account?'),
        a: t('faq.a5_1', 'You can create an account during checkout or by clicking on "Sign Up" on the login page. Having an account helps you track orders and manage your preferences.')
      },
      {
        q: t('faq.q5_2', 'I forgot my password. How do I reset it?'),
        a: t('faq.a5_2', 'Click on "Forgot Password" on the login page and enter your registered email. You will receive a password reset link via email.')
      },
      {
        q: t('faq.q5_3', 'How can I contact customer support?'),
        a: t('faq.a5_3', 'You can reach us via email at {{email}}, call us at {{phone}}, or use the contact form on our website. Our support team is available Monday-Friday, 9 AM to 6 PM.', { email: settings.email, phone: settings.phone })
      },
      {
        q: t('faq.q5_4', 'Where are you located?'),
        a: t('faq.a5_4', 'You can visit us at: {{address}}', { address: settings.address })
      }
    ]
  }
];

const FAQ = () => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let questionIndex = 0;

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 sm:px-6 relative z-10">
        <div className="mx-5 sm:mx-auto max-w-4xl">
          <div className="text-center mb-8 sm:mb-12 px-2 sm:px-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">{t('faq.title', 'Frequently Asked Questions')}</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t('faq.subtitle', 'Find answers to common questions about our products, orders, and services')}
            </p>
          </div>

          <div className="space-y-6">
            {faqs(settings, t).map((category) => (
              <div key={category.category} className="card-elegant p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">{category.category}</h2>
                <div className="space-y-3">
                  {category.questions.map((faq) => {
                    const currentIndex = questionIndex++;
                    const isOpen = openIndex === currentIndex;

                    return (
                      <div
                        key={faq.q}
                        className="border border-border/50 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(currentIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
                        >
                          <span className="font-medium text-foreground pr-4">{faq.q}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-0 text-muted-foreground border-t border-border/50">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">{t('faq.stillHaveQuestions', 'Still have questions?')}</p>
            <a href="/contact" className="btn-primary">
              {t('faq.contactUs', 'Contact Us')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
