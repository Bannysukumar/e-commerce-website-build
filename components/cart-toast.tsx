"use client"

import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface CartToastProps {
  message: string
  type?: ToastType
  onClose: () => void
}

export function CartToast({ message, type = "success", onClose }: CartToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type]

  return (
    <div
      className={`fixed top-20 right-6 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        {type === "success" && <Check className="w-5 h-5 flex-shrink-0" />}
        {type === "error" && <X className="w-5 h-5 flex-shrink-0" />}
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="hover:opacity-80 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
