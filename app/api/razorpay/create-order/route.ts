import { NextRequest, NextResponse } from "next/server"
import { getRazorpayInstance } from "@/lib/razorpay-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "INR", receipt, notes } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    const razorpay = getRazorpayInstance()

    const options = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}

