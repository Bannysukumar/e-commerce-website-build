"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Is refund available?",
    answer: "Yes, we offer refunds for eligible products within 7 days of delivery. Items must be unused, in original packaging, and with all tags attached. Please contact our customer service team to initiate a refund request.",
  },
  {
    question: "Is cash on delivery available?",
    answer: "Yes, we offer cash on delivery (COD) for orders above a certain amount. COD charges may apply. Please check the checkout page for COD availability in your area.",
  },
  {
    question: "Can I wear smartwatches with other accessories?",
    answer: "Absolutely! Our smartwatches are designed to complement various accessories. You can pair them with bracelets, necklaces, and other jewelry pieces to create your unique style.",
  },
  {
    question: "How to choose a perfect ring?",
    answer: "When choosing a ring, consider your finger size, personal style, and the occasion. We recommend measuring your finger size using our size guide, and selecting a design that matches your daily style. Our customer service team is also available to help you find the perfect ring.",
  },
  {
    question: "What is the return policy?",
    answer: "We offer a 7-day return policy for most items. Products must be in original condition with tags attached. Customized or personalized items may not be eligible for return. Please refer to our Returns & Exchange page for detailed information.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 5-7 business days. Express shipping options are available for faster delivery (2-3 business days). Shipping times may vary based on your location and product availability.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we ship within India. International shipping options may be available for select products. Please contact our customer service for more information about international shipping.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this tracking number on our 'Track Your Order' page or the courier's website to monitor your shipment's progress.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4 uppercase" style={{ fontFamily: 'sans-serif' }}>
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-lg text-gray-600">Find answers to common questions about our products and services</p>
        </div>

        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-none mb-4">
                <AccordionTrigger className="hover:no-underline py-0 [&>svg]:hidden">
                  <div className="w-full flex items-center gap-4 text-left group">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 group-data-[state=open]:bg-[#E0E0E0] transition-colors">
                      <ChevronDown className="w-4 h-4 text-[#424242] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                    <span className="text-base font-normal text-[#424242] flex-1" style={{ fontFamily: 'sans-serif' }}>
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-0">
                  <div className="pl-12">
                    <p className="text-base font-normal text-[#424242] leading-relaxed" style={{ fontFamily: 'sans-serif' }}>
                      {faq.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-block bg-[#6B46C1] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5B3FA8] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
