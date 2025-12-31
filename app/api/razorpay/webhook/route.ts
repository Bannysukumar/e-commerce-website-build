import { NextRequest, NextResponse } from "next/server"
import { RAZORPAY_KEY_SECRET } from "@/lib/razorpay-service"
import crypto from "crypto"
import { getAllOrders, updateOrderStatus } from "@/lib/orders-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    const { event: eventType, payload } = event

    console.log("Razorpay webhook received:", eventType, payload)

    // Handle different payment events
    switch (eventType) {
      case "payment.captured":
      case "payment.authorized":
        await handlePaymentSuccess(payload.payment.entity)
        break

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity)
        break

      case "order.paid":
        await handleOrderPaid(payload.order.entity)
        break

      default:
        console.log("Unhandled event type:", eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(payment: any) {
  try {
    console.log("Processing successful payment:", payment.id)

    // Check if order already exists with this payment ID
    const allOrders = await getAllOrders()
    const existingOrder = allOrders.find(
      (order) => order.paymentInfo?.razorpayPaymentId === payment.id
    )

    if (existingOrder) {
      console.log("Order already exists for payment:", payment.id)
      // Update order status if needed
      if (existingOrder.status === "Pending") {
        await updateOrderStatus(existingOrder.id, "Processing")
      }
      return
    }

    // Try to find order by Razorpay order ID
    const orderByRazorpayOrderId = allOrders.find(
      (order) => order.paymentInfo?.razorpayOrderId === payment.order_id
    )

    if (orderByRazorpayOrderId) {
      // Update order status to Processing if it's still Pending
      if (orderByRazorpayOrderId.status === "Pending") {
        await updateOrderStatus(orderByRazorpayOrderId.id, "Processing")
        console.log("Updated existing order status to Processing:", orderByRazorpayOrderId.id)
      }
      return
    }

    // If no order exists, we can't create one from webhook alone
    // The order should be created by the client-side handler or success page
    console.log("No existing order found for payment:", payment.id)
    console.log("Order will be created by client-side handler or success page")
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log("Processing failed payment:", payment.id)

    // Find order by payment ID
    const allOrders = await getAllOrders()
    const order = allOrders.find(
      (order) => order.paymentInfo?.razorpayPaymentId === payment.id ||
                 order.paymentInfo?.razorpayOrderId === payment.order_id
    )

    if (order) {
      // Update order status to cancelled
      await updateOrderStatus(order.id, "Cancelled")
      console.log("Updated order status to Cancelled:", order.id)
    }
  } catch (error) {
    console.error("Error handling payment failed:", error)
  }
}

async function handleOrderPaid(order: any) {
  try {
    console.log("Processing paid order:", order.id)

    // Find order by Razorpay order ID
    const allOrders = await getAllOrders()
    const existingOrder = allOrders.find(
      (orderItem) => orderItem.paymentInfo?.razorpayOrderId === order.id
    )

    if (existingOrder) {
      // Update order status to Processing
      if (existingOrder.status === "Pending") {
        await updateOrderStatus(existingOrder.id, "Processing")
        console.log("Updated order status to Processing:", existingOrder.id)
      }
    }
  } catch (error) {
    console.error("Error handling order paid:", error)
  }
}

// Allow GET for webhook verification (Razorpay may ping the endpoint)
export async function GET() {
  return NextResponse.json({ 
    message: "Razorpay webhook endpoint is active",
    endpoint: "/api/razorpay/webhook"
  })
}

