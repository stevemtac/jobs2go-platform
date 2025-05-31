"use client"

import { useEffect } from "react"
import { trackError } from "@/lib/monitoring/monitoring-service"

export function ClientErrorMonitor() {
  useEffect(() => {
    // Save original console.error
    const originalConsoleError = console.error

    // Override console.error to track errors
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args)

      // Track the error
      const errorMessage = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")

      trackError("Console error", new Error(errorMessage))
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        "Unhandled promise rejection",
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      )
    }

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      trackError("Uncaught error", event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    // Clean up
    return () => {
      console.error = originalConsoleError
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [])

  // This component doesn't render anything
  return null
}
