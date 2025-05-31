"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorRateChart } from "./error-rate-chart"
import { PerformanceMetricsChart } from "./performance-metrics-chart"
import { DatabaseMetricsChart } from "./database-metrics-chart"
import { SystemHealthStatus } from "./system-health-status"
import { AlertsLog } from "./alerts-log"
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface DashboardMetrics {
  systemHealth: "healthy" | "warning" | "critical"
  errorRate: number
  responseTime: number
  uptime: number
  activeUsers: number
  totalRequests: number
  lastUpdated: string
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    systemHealth: "healthy",
    errorRate: 0.5,
    responseTime: 245,
    uptime: 99.9,
    activeUsers: 1247,
    totalRequests: 45678,
    lastUpdated: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/monitoring/metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time system monitoring and performance metrics</p>
        </div>
        <Button onClick={fetchMetrics} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getHealthIcon(metrics.systemHealth)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getHealthColor(metrics.systemHealth)}`} />
              <span className="text-2xl font-bold capitalize">{metrics.systemHealth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <Badge variant={metrics.errorRate > 1 ? "destructive" : "secondary"} className="mt-1">
              {metrics.errorRate > 1 ? "High" : "Normal"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <Badge variant={metrics.responseTime > 500 ? "destructive" : "secondary"} className="mt-1">
              {metrics.responseTime > 500 ? "Slow" : "Fast"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <Badge variant={metrics.uptime > 99 ? "secondary" : "destructive"} className="mt-1">
              {metrics.uptime > 99 ? "Excellent" : "Poor"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ErrorRateChart />
            <SystemHealthStatus />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetricsChart />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseMetricsChart />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsLog />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-sm text-muted-foreground text-center">
        Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}
