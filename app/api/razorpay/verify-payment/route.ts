import { NextRequest, NextResponse } from "next/server"
import { getRazorpayInstance, RAZORPAY_KEY_SECRET } from "@/lib/razorpay-service"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      )
    }

    // Verify the signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex")

    const isSignatureValid = generatedSignature === razorpay_signature

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Invalid payment signature", verified: false },
        { status: 400 }
      )
    }

    // Fetch payment details from Razorpay
    const razorpay = getRazorpayInstance()
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    return NextResponse.json({
      verified: true,
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
      },
    })
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify payment", verified: false },
      { status: 500 }
    )
  }
}

