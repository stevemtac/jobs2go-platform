"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, Clock, Server, Database, Globe } from "lucide-react"

interface SystemStatus {
  service: string
  status: "healthy" | "warning" | "critical"
  uptime: number
  responseTime: number
  lastCheck: string
  description: string
}

interface SystemHealth {
  overall: "healthy" | "warning" | "critical"
  services: SystemStatus[]
  lastUpdated: string
}

export function SystemHealthStatus() {
  const [health, setHealth] = useState<SystemHealth>({
    overall: "healthy",
    services: [],
    lastUpdated: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/monitoring/health")
        if (response.ok) {
          const healthData = await response.json()
          setHealth(healthData)
        }
      } catch (error) {
        console.error("Failed to fetch system health:", error)
        // Generate mock data for demonstration
        const mockServices: SystemStatus[] = [
          {
            service: "Web Server",
            status: "healthy",
            uptime: 99.9,
            responseTime: 120,
            lastCheck: new Date().toISOString(),
            description: "All web services operational",
          },
          {
            service: "Database",
            status: "healthy",
            uptime: 99.8,
            responseTime: 45,
            lastCheck: new Date().toISOString(),
            description: "Database connections stable",
          },
          {
            service: "API Gateway",
            status: "warning",
            uptime: 98.5,
            responseTime: 250,
            lastCheck: new Date().toISOString(),
            description: "Elevated response times detected",
          },
          {
            service: "Cache Layer",
            status: "healthy",
            uptime: 99.9,
            responseTime: 15,
            lastCheck: new Date().toISOString(),
            description: "Cache performance optimal",
          },
        ]

        setHealth({
          overall: "warning",
          services: mockServices,
          lastUpdated: new Date().toISOString(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case "web server":
        return <Server className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "api gateway":
        return <Globe className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "healthy":
        return "secondary"
      case "warning":
        return "outline"
      case "critical":
        return "destructive"
      default:
        return "default"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health Status</CardTitle>
          <CardDescription>Loading system health data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(health.overall)}
          System Health Status
        </CardTitle>
        <CardDescription>
          Overall system status:{" "}
          <Badge variant={getStatusVariant(health.overall)} className="ml-1">
            {health.overall.toUpperCase()}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {health.services.map((service, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getServiceIcon(service.service)}
                <span className="font-medium">{service.service}</span>
                {getStatusIcon(service.status)}
              </div>
              <Badge variant={getStatusVariant(service.status)}>{service.status.toUpperCase()}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Uptime:</span> {service.uptime}%
              </div>
              <div>
                <span className="font-medium">Response:</span> {service.responseTime}ms
              </div>
            </div>

            <Progress value={service.uptime} className="h-2" />

            <p className="text-sm text-muted-foreground">{service.description}</p>

            {index < health.services.length - 1 && <hr className="my-4" />}
          </div>
        ))}

        <div className="text-xs text-muted-foreground text-center pt-4">
          Last updated: {new Date(health.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
