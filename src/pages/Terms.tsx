import Navigation from '@/components/Navigation';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const Terms = () => {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="card-elegant p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Terms & Conditions</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: December 2025</p>

            <div className="space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using the Indhumathi website, you accept and agree to be bound by the terms and 
                  provision of this agreement. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Use License</h2>
                <p>
                  Permission is granted to temporarily download one copy of the materials on Indhumathi's website 
                  for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer 
                  of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Product Information</h2>
                <p>
                  We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant 
                  that product descriptions or other content on this site is accurate, complete, reliable, current, 
                  or error-free. If a product offered by us is not as described, your sole remedy is to return it in 
                  unused condition.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Pricing and Payment</h2>
                <p>
                  All prices are listed in Indian Rupees (₹) and are subject to change without notice. We reserve 
                  the right to modify prices at any time. Payment must be received before order processing and shipment.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Orders and Shipping</h2>
                <p>
                  All orders are subject to product availability. We reserve the right to refuse or cancel any order 
                  for any reason. Shipping times are estimates and not guaranteed. We are not responsible for delays 
                  caused by shipping carriers or customs.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Returns and Refunds</h2>
                <p>
                  Our return policy allows returns within 7 days of delivery for unused products with tags attached. 
                  Refunds will be processed to the original payment method within 5-7 business days after we receive 
                  the returned product. For hygiene reasons, worn or washed innerwear cannot be returned.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
                <p>
                  In no event shall Indhumathi or its suppliers be liable for any damages (including, without limitation, 
                  damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                  to use the materials on Indhumathi's website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Privacy Policy</h2>
                <p>
                  Your use of our website is also governed by our Privacy Policy. Please review our Privacy Policy to 
                  understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Information</h2>
                <p>
                  For any questions regarding these Terms & Conditions, please contact us at:
                </p>
                <p className="mt-2">
                  Email: support@indhumathi.com<br />
                  Phone: +91 98765 43210<br />
                  Address: 123 Cotton Street, Textile District, Coimbatore, Tamil Nadu 641001
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
