"use client"

export default function TermsAndConditionsClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">By accessing and purchasing from SweBird, you agree to the following terms:</p>
        </div>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              All products sold are replica / first copy products, not originals.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Product colors and appearance may slightly vary due to lighting and screen differences.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Orders once placed cannot be cancelled.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              No refunds or returns without an unboxing video.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-4">
              SweBird reserves the right to change prices, policies, or product details at any time without prior notice.
            </p>
          </section>

          <section>
            <p className="text-foreground/90 leading-relaxed mb-8">
              Any misuse of return policy or false claims may result in order rejection or account blocking.
            </p>
          </section>

          <div className="border-t border-border pt-8 mt-8">
            <h2 className="text-3xl font-bold mb-6">Payment Policy</h2>
            
            <section className="mb-4">
              <p className="text-foreground/90 leading-relaxed mb-4">
                Cash on Delivery (COD) is NOT available.
              </p>
            </section>

            <section className="mb-4">
              <p className="text-foreground/90 leading-relaxed mb-4">
                Only online payments are accepted through secure payment gateways.
              </p>
            </section>

            <section className="mb-8">
              <p className="text-foreground/90 leading-relaxed">
                Orders will be processed only after successful payment.
              </p>
            </section>
          </div>

          <div className="border-t border-border pt-8 mt-8">
            <h2 className="text-3xl font-bold mb-6">Contact</h2>
            
            <section>
              <p className="text-foreground/90 leading-relaxed mb-4">
                For any support or queries, customers can contact SweBird through the official contact details provided on the website.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-foreground/90 font-semibold mb-2">Owner: Swechha</p>
                <p className="text-foreground/90 font-semibold">Store Name: SweBird</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
