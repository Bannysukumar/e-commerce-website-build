"use client"

export default function PrivacyPolicyClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">SweBird respects your privacy.</p>
        </div>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              We collect basic customer information such as name, phone number, email, and address only for order processing and delivery.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Your personal data is never sold, shared, or misused.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Payment details are processed securely through trusted third-party payment gateways. SweBird does not store card or UPI details.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-8">
              By using our website, you agree to our privacy practices.
            </p>
          </section>

          <div className="border-t border-border pt-8 mt-8">
            <h2 className="text-3xl font-bold mb-6">Swe Bird – Website Policies</h2>
            
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4">About Our Products (Important Disclosure)</h3>
            <p className="text-foreground/90 leading-relaxed mb-4">
                SweBird sells fashion and lifestyle products such as gadgets, watches, smart watches, handbags, belts, shoes, and clothing for men and women. All products sold on SweBird are NOT original branded products. These are First Copy / Master Copy / Replica products with different quality grades such as 7A, 5A, etc.
              </p>
            <p className="text-foreground/90 leading-relaxed">
                We do not claim any product to be original. Customers are requested to purchase only after clearly understanding this point.
            </p>
            </section>
            </div>
        </div>
      </div>
    </main>
  )
}
