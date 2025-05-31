"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface HealthCheckResponse {
  status: "ok" | "error"
  message: string
  timestamp?: string
  environment?: string
  missingExports?: string[]
  error?: string
}

export function DeploymentVerificationContent() {
  const [healthCheck, setHealthCheck] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const checkModules = [
    { name: "prisma", path: "lib/prisma.ts" },
    { name: "hasPermission", path: "lib/auth/permissions.ts" },
    { name: "authOptions", path: "app/api/auth/[...nextauth]/route.ts" },
    { name: "CleanupScheduleList", path: "components/error-monitoring/cleanup-schedule-list.tsx" },
    { name: "notifySourceMapOperation", path: "lib/error-monitoring/source-map-notifications.ts" },
  ]

  useEffect(() => {
    const fetchHealthCheck = async () => {
      setLoading(true)
      setError(null)

      try {
        // Add a cache-busting parameter if refresh is requested
        const cacheBuster = searchParams.get("refresh") ? `?t=${Date.now()}` : ""
        const response = await fetch(`/api/health/deployment${cacheBuster}`)

        if (!response.ok) {
          throw new Error(`Health check failed with status: ${response.status}`)
        }

        const data = await response.json()
        setHealthCheck(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check deployment health")
        console.error("Deployment verification error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthCheck()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking deployment health...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error checking deployment</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!healthCheck) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No health check data</AlertTitle>
        <AlertDescription>Could not retrieve health check data.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Deployment Status</h3>
          <p className="text-sm text-muted-foreground">
            {healthCheck.timestamp ? new Date(healthCheck.timestamp).toLocaleString() : "Unknown time"}
          </p>
        </div>
        <Badge variant={healthCheck.status === "ok" ? "default" : "destructive"}>
          {healthCheck.status === "ok" ? "Healthy" : "Unhealthy"}
        </Badge>
      </div>

      <div className="border rounded-md">
        <div className="p-4 bg-muted/50">
          <h4 className="font-medium">Module Export Verification</h4>
        </div>
        <div className="p-4 divide-y">
          {checkModules.map((module) => (
            <div key={module.name} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{module.name}</p>
                <p className="text-sm text-muted-foreground">{module.path}</p>
              </div>
              {healthCheck.status === "ok" || !healthCheck.missingExports?.includes(module.name) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {healthCheck.status === "ok" ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Deployment Successful</AlertTitle>
          <AlertDescription>
            All required exports are available. The application should be functioning properly.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Deployment Issues Detected</AlertTitle>
          <AlertDescription>
            {healthCheck.message}
            {healthCheck.missingExports && healthCheck.missingExports.length > 0 && (
              <div className="mt-2">
                <p>Missing exports:</p>
                <ul className="list-disc pl-5 mt-1">
                  {healthCheck.missingExports.map((exp) => (
                    <li key={exp}>{exp}</li>
                  ))}
                </ul>
              </div>
            )}
            {healthCheck.error && (
              <div className="mt-2">
                <p>Error details:</p>
                <pre className="bg-red-950 text-white p-2 rounded mt-1 text-xs overflow-x-auto">
                  {healthCheck.error}
                </pre>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Environment: {healthCheck.environment || "Unknown"}</p>
      </div>
    </div>
  )
}
