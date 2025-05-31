"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, EyeOff } from "lucide-react"

interface Alert {
  id: string
  title: string
  message: string
  severity: "info" | "warning" | "error"
  timestamp: string
  acknowledged: boolean
  source: string
}

export function AlertsLog() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unacknowledged">("all")

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/monitoring/alerts")
        if (response.ok) {
          const alertsData = await response.json()
          setAlerts(alertsData)
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error)
        // Generate mock data for demonstration
        const mockAlerts: Alert[] = [
          {
            id: "1",
            title: "High Error Rate Detected",
            message: "Error rate has exceeded 2% threshold for the past 5 minutes",
            severity: "error",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            acknowledged: false,
            source: "Error Monitoring",
          },
          {
            id: "2",
            title: "Slow Database Queries",
            message: "Multiple slow queries detected in the jobs table",
            severity: "warning",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            acknowledged: true,
            source: "Database Monitor",
          },
          {
            id: "3",
            title: "High Memory Usage",
            message: "Memory usage has reached 85% on production server",
            severity: "warning",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            acknowledged: false,
            source: "System Monitor",
          },
          {
            id: "4",
            title: "API Rate Limit Exceeded",
            message: "Rate limit exceeded for external API integration",
            severity: "info",
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            acknowledged: true,
            source: "API Gateway",
          },
        ]
        setAlerts(mockAlerts)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
        method: "POST",
      })

      if (response.ok) {
        setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
      }
    } catch (error) {
      console.error("Failed to acknowledge alert:", error)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case "error":
        return "destructive"
      case "warning":
        return "outline"
      case "info":
        return "secondary"
      default:
        return "default"
    }
  }

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((alert) => !alert.acknowledged)

  const unacknowledgedCount = alerts.filter((alert) => !alert.acknowledged).length

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts Log</CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts Log</CardTitle>
        <CardDescription>System alerts and notifications ({unacknowledgedCount} unacknowledged)</CardDescription>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All Alerts ({alerts.length})
          </Button>
          <Button
            variant={filter === "unacknowledged" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unacknowledged")}
          >
            Unacknowledged ({unacknowledgedCount})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No alerts to display</div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg space-y-2 ${alert.acknowledged ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant={getSeverityVariant(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                    </div>
                    {!alert.acknowledged && (
                      <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {alert.acknowledged && (
                      <Badge variant="secondary">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{alert.message}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Source: {alert.source}</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
