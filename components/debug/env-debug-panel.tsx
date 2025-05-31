"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface EnvDebugData {
  success: boolean
  environment: string
  validation: {
    success: boolean
    errors: string[]
  }
  variables: {
    public: Record<string, string>
    server: Record<string, string>
    total: number
  }
  vercel: {
    env?: string
    url?: string
    region?: string
    gitCommitSha?: string
  }
  error?: string
}

export function EnvDebugPanel() {
  const [debugData, setDebugData] = useState<EnvDebugData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/env", {
        headers: {
          "x-debug-token": "debug-123", // In production, use a secure token
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setDebugData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch debug data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  // Check client-side environment variables
  const clientEnvVars = Object.keys(process.env)
    .filter((key) => key.startsWith("NEXT_PUBLIC_"))
    .reduce(
      (acc, key) => {
        acc[key] = process.env[key] || "NOT_SET"
        return acc
      },
      {} as Record<string, string>,
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Environment Variables Debug</h2>
          <p className="text-muted-foreground">Diagnose environment variable configuration issues</p>
        </div>
        <Button onClick={fetchDebugData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="public">Public Variables</TabsTrigger>
            <TabsTrigger value="server">Server Variables</TabsTrigger>
            <TabsTrigger value="client">Client Check</TabsTrigger>
            <TabsTrigger value="vercel">Vercel Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Environment</CardTitle>
                  <Badge variant={debugData.environment === "production" ? "default" : "secondary"}>
                    {debugData.environment}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{debugData.environment}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Validation</CardTitle>
                  {debugData.validation.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{debugData.validation.success ? "PASSED" : "FAILED"}</div>
                  {debugData.validation.errors.length > 0 && (
                    <p className="text-xs text-muted-foreground">{debugData.validation.errors.length} errors</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Public Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(debugData.variables.public).length}</div>
                  <p className="text-xs text-muted-foreground">NEXT_PUBLIC_* variables</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Server Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(debugData.variables.server).length}</div>
                  <p className="text-xs text-muted-foreground">Server-only variables</p>
                </CardContent>
              </Card>
            </div>

            {debugData.validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Environment Validation Errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {debugData.validation.errors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="public">
            <Card>
              <CardHeader>
                <CardTitle>Public Environment Variables</CardTitle>
                <CardDescription>Variables accessible on both client and server (NEXT_PUBLIC_*)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(debugData.variables.public).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                      <code className="text-sm font-mono">{key}</code>
                      <Badge variant={value === "NOT_SET" ? "destructive" : "default"}>
                        {value === "NOT_SET" ? "NOT SET" : "SET"}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(debugData.variables.public).length === 0 && (
                    <p className="text-muted-foreground">No public environment variables found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="server">
            <Card>
              <CardHeader>
                <CardTitle>Server Environment Variables</CardTitle>
                <CardDescription>
                  Variables accessible only on the server (values are masked for security)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(debugData.variables.server).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                      <code className="text-sm font-mono">{key}</code>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{value}</code>
                        <Badge variant={value === "NOT_SET" ? "destructive" : "default"}>
                          {value === "NOT_SET" ? "NOT SET" : "SET"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {Object.keys(debugData.variables.server).length === 0 && (
                    <p className="text-muted-foreground">No server environment variables found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Client-Side Environment Check</CardTitle>
                <CardDescription>Variables accessible in the browser (should only be NEXT_PUBLIC_*)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(clientEnvVars).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                      <code className="text-sm font-mono">{key}</code>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{value}</code>
                        <Badge variant={value === "NOT_SET" ? "destructive" : "default"}>
                          {value === "NOT_SET" ? "NOT SET" : "SET"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {Object.keys(clientEnvVars).length === 0 && (
                    <p className="text-muted-foreground">No client environment variables found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vercel">
            <Card>
              <CardHeader>
                <CardTitle>Vercel Deployment Info</CardTitle>
                <CardDescription>Information about the current Vercel deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Environment</span>
                    <Badge>{debugData.vercel.env || "Not detected"}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">URL</span>
                    <code className="text-xs">{debugData.vercel.url || "Not available"}</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Region</span>
                    <code className="text-xs">{debugData.vercel.region || "Not available"}</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Git Commit</span>
                    <code className="text-xs">{debugData.vercel.gitCommitSha?.substring(0, 8) || "Not available"}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
