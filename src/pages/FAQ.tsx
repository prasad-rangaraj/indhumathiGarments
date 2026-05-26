import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const faqs = (settings: any) => [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for select locations.'
      },
      {
        q: 'What are the shipping charges?',
        a: 'We offer free shipping on all orders above ₹500. For orders below ₹500, a nominal shipping charge of ₹50 applies.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! You can easily track your order status by logging into your account, navigating to your Profile, and checking the "My Orders" tab. You will also receive email updates as your order progresses.'
      },
      {
        q: 'Do you ship internationally?',
        a: 'Currently, we only ship within India. We are working on expanding our shipping to international locations soon.'
      }
    ]
  },
  {
    category: 'Returns & Exchanges',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day easy return policy from the date of delivery. Products must be unused, with tags attached and in original packaging. For hygiene reasons, worn or washed innerwear cannot be accepted for return.'
      },
      {
        q: 'How do I initiate a return?',
        a: `Contact our support team with your Order ID and product details. You can reach us at ${settings.email} or call ${settings.phone}.`
      },
      {
        q: 'Will I get a full refund?',
        a: 'Yes, you will receive a full refund for eligible returns. The refund will be processed to your original payment method within 5-7 business days after we receive the returned product.'
      },
      {
        q: 'Can I exchange a product for a different size?',
        a: 'Yes, you can exchange for a different size within 7 days of delivery, subject to availability. Please contact our support team to initiate an exchange.'
      }
    ]
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'What material are your products made of?',
        a: 'Our signature garments, including our innerwear and trackpants, are crafted from high-quality, breathable cotton blends to ensure maximum comfort and durability for everyday wear.'
      },
      {
        q: 'How do I know my correct size?',
        a: 'We provide a detailed size guide on each product page. You can also contact our customer support for personalized size recommendations.'
      },
      {
        q: 'Do you offer products for both men and women?',
        a: 'Yes! We have dedicated collections tailored for both men and women, featuring comfortable innerwear, t-shirts, and trackpants.'
      },
      {
        q: 'How should I wash and care for the garments?',
        a: 'For best results, machine wash in cold water with similar colors. Do not bleach. Tumble dry on low or dry in the shade to maintain the fabric\'s softness.'
      }
    ]
  },
  {
    category: 'Payment & Security',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, Credit/Debit Cards, and Cash on Delivery (COD). All online payments are secured through our payment gateway partners.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, we use industry-standard encryption and secure payment gateways. We do not store your card details on our servers.'
      },
      {
        q: 'Do you offer Cash on Delivery?',
        a: 'Yes, Cash on Delivery is available for all orders. A small COD charge may apply for orders below ₹500.'
      }
    ]
  },
  {
    category: 'Account & Support',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'You can create an account during checkout or by clicking on "Sign Up" on the login page. Having an account helps you track orders and manage your preferences.'
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click on "Forgot Password" on the login page and enter your registered email. You will receive a password reset link via email.'
      },
      {
        q: 'How can I contact customer support?',
        a: `You can reach us via email at ${settings.email}, call us at ${settings.phone}, or use the contact form on our website. Our support team is available Monday-Friday, 9 AM to 6 PM.`
      },
      {
        q: 'Where are you located?',
        a: `You can visit us at: ${settings.address}`
      }
    ]
  }
];

const FAQ = () => {
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Frequently Asked Questions</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Find answers to common questions about our products, orders, and services
            </p>
          </div>

          <div className="space-y-6">
            {faqs(settings).map((category) => (
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
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <a href="/contact" className="btn-primary">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
