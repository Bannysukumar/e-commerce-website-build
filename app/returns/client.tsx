"use client"

export default function ReturnsAndRefundsPageClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Return & Replacement Policy</h1>
          <p className="text-muted-foreground">Please read this policy carefully before placing an order.</p>
        </div>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. No Returns for Personal Preference</h2>
            <p className="text-foreground/90 leading-relaxed">
              Returns are NOT accepted if you do not like the product, change your mind, or have size/style preference issues.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Return Accepted Only for Defective Products</h2>
            <p className="text-foreground/90 leading-relaxed">
              A return or replacement is accepted ONLY if the product is defective or damaged at the time of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Mandatory Unboxing Video <span className="text-lg font-normal">شرط</span></h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              To claim a return, customers must provide a clear unboxing video recorded from start to end without any cuts.
            </p>
            <p className="text-foreground/90 leading-relaxed mb-2">The video must show:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Sealed package</li>
              <li>Opening of the package</li>
              <li>Full product clearly showing the defect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. No Video = No Return</h2>
            <p className="text-foreground/90 leading-relaxed">
              If an unboxing video is not provided, no return or replacement will be accepted under any condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Return Approval</h2>
            <p className="text-foreground/90 leading-relaxed">
              After reviewing the video, SweBird will decide whether the return or replacement is valid. The final decision rests with Sweet Bird.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
