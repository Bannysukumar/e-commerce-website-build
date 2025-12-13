import ShippingPolicyLayout from "./layout"

export default function ShippingPolicyPage() {
  return (
    <ShippingPolicyLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Shipping Policy</h1>
        <p className="text-muted-foreground">Last updated: December 2024</p>
      </div>

      <div className="space-y-8 prose prose-invert max-w-none">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Shipping Options</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            We offer multiple shipping options to meet your needs. Choose your preferred delivery speed at checkout:
          </p>
          <div className="space-y-4">
            <div className="p-4 border border-muted rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Standard Shipping</h3>
              <p className="text-foreground/90">5-7 business days | ₹5.99</p>
              <p className="text-sm text-foreground/70">Perfect for budget-conscious customers</p>
            </div>
            <div className="p-4 border border-muted rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Express Shipping</h3>
              <p className="text-foreground/90">2-3 business days | ₹14.99</p>
              <p className="text-sm text-foreground/70">Faster delivery for urgent needs</p>
            </div>
            <div className="p-4 border border-muted rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Overnight Shipping</h3>
              <p className="text-foreground/90">Next business day | $24.99</p>
              <p className="text-sm text-foreground/70">Next day delivery for immediate needs</p>
            </div>
            <div className="p-4 border border-muted rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Free Shipping</h3>
              <p className="text-foreground/90">5-7 business days</p>
              <p className="text-sm text-foreground/70">On orders over ₹50 (Standard Shipping only)</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Processing Time</h2>
          <p className="text-foreground/90 leading-relaxed">
            Orders are processed and prepared for shipment within 1-2 business days. Orders placed on weekends or
            holidays will be processed on the next business day. Once your order has been shipped, you will receive a
            tracking number via email.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Delivery Timeframes</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            Delivery timeframes are estimates and not guaranteed. The following timeframes are approximate and exclude
            weekends and holidays:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground/90">
            <li>Standard Shipping: 5-7 business days</li>
            <li>Express Shipping: 2-3 business days</li>
            <li>Overnight Shipping: Next business day (if ordered before 2 PM)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Shipping Locations</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">We currently ship to:</p>
          <ul className="list-disc list-inside space-y-2 text-foreground/90">
            <li>All 50 US states</li>
            <li>Canada</li>
            <li>Selected international locations</li>
          </ul>
          <p className="text-foreground/90 leading-relaxed mt-4">
            International shipping rates and times vary by location. Please enter your address at checkout to see
            available options and costs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Order Tracking</h2>
          <p className="text-foreground/90 leading-relaxed">
            Once your order ships, you will receive an email with a tracking number and a link to track your package in
            real-time. You can also track your order by logging into your account and viewing your order history.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Delivery Attempts</h2>
          <p className="text-foreground/90 leading-relaxed">
            If a delivery attempt fails, the carrier will typically leave a notice and attempt redelivery. You can
            contact the carrier using the tracking number to arrange delivery or pick up your package. swebirdshop is
            not responsible for packages left on porches or unattended locations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Lost or Damaged Shipments</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            In the rare event that your package is lost or arrives damaged:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-foreground/90 mb-4">
            <li>Contact us immediately with your order number and tracking information</li>
            <li>For damaged items, provide photos of the damage</li>
            <li>We will file a claim with the carrier and send you a replacement</li>
            <li>You may be asked to file a claim with the carrier as well</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Signature Required</h2>
          <p className="text-foreground/90 leading-relaxed">
            For high-value items or at customer request, we may require a signature upon delivery. If you select
            Overnight or Express Shipping, a signature may be required automatically.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Address Changes</h2>
          <p className="text-foreground/90 leading-relaxed">
            If you need to change your delivery address, please contact us immediately after placing your order. Once an
            order has entered the shipping process, we may not be able to change the address. Please ensure your address
            is correct at checkout to avoid delays.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
          <p className="text-foreground/90 leading-relaxed">
            For shipping inquiries or concerns, please contact our customer service team:
          </p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-foreground/90">Email: support@swebirdshop.com</p>
            <p className="text-foreground/90">Phone: +1 (234) 567-890</p>
            <p className="text-foreground/90">Hours: Monday - Friday, 9 AM - 5 PM</p>
          </div>
        </section>
      </div>
    </ShippingPolicyLayout>
  )
}
