import Navigation from '@/components/Navigation';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const Privacy = () => {
  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="mx:4 sm:mx-auto max-w-4xl">
          <div className="card-elegant p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: December 2025</p>

            <div className="space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                <p className="mb-2">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name, email address, phone number, and shipping address</li>
                  <li>Payment information (processed securely through payment gateways)</li>
                  <li>Order history and preferences</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Process and fulfill your orders</li>
                  <li>Send you order confirmations and updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Detect and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Information Sharing</h2>
                <p>
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Shipping partners to deliver your orders</li>
                  <li>Payment processors to handle transactions</li>
                  <li>Service providers who assist in our operations</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information. However, no method
                  of transmission over the internet is 100% secure. While we strive to protect your data, we cannot
                  guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your browsing experience, analyze website
                  traffic, and personalize content. You can control cookies through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Children's Privacy</h2>
                <p>
                  Our services are not intended for children under 18. We do not knowingly collect personal information
                  from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2">
                  Email: privacy@indhumathi.com<br />
                  Phone: +91 87546 09226<br />
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

export default Privacy;




