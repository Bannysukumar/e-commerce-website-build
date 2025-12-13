"use client"

import { Check } from "lucide-react"

interface CheckoutProgressProps {
  currentStep: number
}

const steps = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
]

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  currentStep >= step.id
                    ? "bg-accent border-accent text-accent-foreground scale-110"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-all duration-300 ${
                  currentStep >= step.id ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${
                  currentStep > step.id ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
