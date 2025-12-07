"use client"

export default function PrivacyPolicyClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </div>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Welcome to swebirdshop ("we," "us," "our," or "Company"). We are committed to protecting your privacy and
              ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold mb-2">Information You Provide Directly:</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 mb-4">
              <li>Account registration information (name, email, password, address)</li>
              <li>Payment information (credit card details processed securely)</li>
              <li>Order information and purchase history</li>
              <li>Customer service inquiries and communications</li>
              <li>Wishlist and saved preferences</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Information Collected Automatically:</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/90">
              <li>Browser and device information</li>
              <li>IP address and location data</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Browsing behavior and pages visited</li>
              <li>Usage patterns and analytics data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Sending promotional emails and marketing communications</li>
              <li>Improving our website and user experience</li>
              <li>Preventing fraud and enhancing security</li>
              <li>Complying with legal obligations</li>
              <li>Personalizing your shopping experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. However, we may share your
              information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90">
              <li>With shipping partners to deliver your orders</li>
              <li>With payment processors for transaction processing</li>
              <li>With analytics providers to improve our services</li>
              <li>When required by law or court order</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-foreground/90 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the Internet or electronic storage is completely secure. While we strive to protect your data, we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
            <p className="text-foreground/90 leading-relaxed">
              Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your
              device that help us remember your preferences, track your activity, and improve our services. You can
              control cookie settings through your browser preferences, though some features may not work properly if
              cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to request deletion of your data</li>
              <li>Right to opt-out of marketing communications</li>
              <li>Right to data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/90">Email: support@swebirdshop.com</p>
              <p className="text-foreground/90">Phone: +1 (234) 567-890</p>
              <p className="text-foreground/90">Address: 123 Shopping St, Commerce City</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
