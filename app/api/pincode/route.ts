import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const pincode = searchParams.get("pincode")

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Invalid PIN code. Must be 6 digits." },
      { status: 400 }
    )
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const apiUrl = `http://www.postalpincode.in/api/pincode/${pincode}`
    console.log(`Fetching PIN code data from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Next.js)",
      },
      signal: controller.signal,
      // Add cache control
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    console.log(`PIN code API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`PIN code API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `API returned status ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`PIN code API success for ${pincode}:`, data)
    
    // Validate response structure
    if (!data || !data.PostOffice || !Array.isArray(data.PostOffice)) {
      console.error("Invalid API response structure:", data)
      return NextResponse.json(
        { error: "Invalid response from PIN code API" },
        { status: 502 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching PIN code data:", error)
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 504 }
      )
    }

    // Check for network errors
    if (error.message?.includes("fetch failed") || error.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Could not connect to PIN code service. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to fetch PIN code data. Please try again later.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

