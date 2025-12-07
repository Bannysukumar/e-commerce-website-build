"use client"

export default function ReturnsAndRefundsPageClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Returns & Refunds Policy</h1>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </div>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Return Period</h2>
            <p className="text-foreground/90 leading-relaxed">
              We want you to be completely satisfied with your purchase. If you are not happy with your order, you may
              return eligible items within 30 days of delivery for a full refund or exchange. Items must be in original
              condition with all tags attached and original packaging.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Eligibility for Returns</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">Items are eligible for return if they:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90">
              <li>Are returned within 30 days of delivery</li>
              <li>Are unused and in original condition</li>
              <li>Have all original tags and labels attached</li>
              <li>Are in original, undamaged packaging</li>
              <li>Are not final sale or clearance items</li>
              <li>Are not personalized or custom-made items</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Non-Returnable Items</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">The following items cannot be returned:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90">
              <li>Final sale or clearance marked items</li>
              <li>Personalized or custom-made products</li>
              <li>Digital products or software</li>
              <li>Items damaged due to customer misuse</li>
              <li>Items with missing or damaged packaging</li>
              <li>Items purchased more than 30 days ago</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. How to Initiate a Return</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">To return an item, please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-foreground/90 mb-4">
              <li>Log in to your account and go to "Order History"</li>
              <li>Select the order containing the item you wish to return</li>
              <li>Click "Return Item" and select your reason for return</li>
              <li>Print the prepaid return shipping label</li>
              <li>Package the item securely and attach the return label</li>
              <li>Ship the package to the provided address</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Refund Processing</h2>
            <p className="text-foreground/90 leading-relaxed">
              Once we receive and inspect your returned item, we will process your refund within 7-10 business days. The
              refund will be credited to your original payment method. Please note that it may take an additional 3-5
              business days for the credit to appear on your account, depending on your financial institution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Return Shipping</h2>
            <p className="text-foreground/90 leading-relaxed">
              We provide a prepaid return shipping label for all eligible returns. If you choose to use your own
              shipping method, swebirdshop is not responsible for lost or damaged items during return shipping. We
              recommend using a tracked shipping service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Exchanges</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you would like to exchange an item for a different size or color, please note that exchanges are
              treated as returns followed by a new purchase. The original item must be returned first, and a new order
              must be placed for the replacement item. Shipping costs apply to the new order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Defective Items</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you receive a defective or damaged item, please contact our customer service team immediately with
              photos of the defect. We will arrange for a replacement or full refund at no cost to you, including return
              and replacement shipping.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              For questions about returns or refunds, please contact our customer service team:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/90">Email: support@swebirdshop.com</p>
              <p className="text-foreground/90">Phone: +1 (234) 567-890</p>
              <p className="text-foreground/90">Hours: Monday - Friday, 9 AM - 5 PM</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
