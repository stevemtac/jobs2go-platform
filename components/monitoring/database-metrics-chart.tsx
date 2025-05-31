"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

interface DatabaseMetrics {
  timestamp: string
  connections: number
  queryTime: number
  slowQueries: number
  cacheHitRate: number
}

export function DatabaseMetricsChart() {
  const [data, setData] = useState<DatabaseMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/monitoring/database")
        if (response.ok) {
          const dbData = await response.json()
          setData(dbData)
        }
      } catch (error) {
        console.error("Failed to fetch database metrics:", error)
        // Generate mock data for demonstration
        const mockData = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          connections: Math.floor(Math.random() * 50) + 10,
          queryTime: Math.random() * 100 + 10,
          slowQueries: Math.floor(Math.random() * 5),
          cacheHitRate: Math.random() * 20 + 80,
        }))
        setData(mockData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const averageConnections =
    data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.connections, 0) / data.length) : 0

  const averageQueryTime =
    data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.queryTime, 0) / data.length) : 0

  const averageCacheHitRate =
    data.length > 0 ? (data.reduce((sum, item) => sum + item.cacheHitRate, 0) / data.length).toFixed(1) : "0.0"

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Metrics</CardTitle>
          <CardDescription>Loading database metrics...</CardDescription>
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
        <CardTitle>Database Metrics</CardTitle>
        <CardDescription>
          Database performance over the last 24 hours (Avg Connections: {averageConnections}, Avg Query Time:{" "}
          {averageQueryTime}ms, Cache Hit Rate: {averageCacheHitRate}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            connections: {
              label: "Active Connections",
              color: "hsl(var(--chart-1))",
            },
            queryTime: {
              label: "Query Time (ms)",
              color: "hsl(var(--chart-2))",
            },
            slowQueries: {
              label: "Slow Queries",
              color: "hsl(var(--chart-3))",
            },
            cacheHitRate: {
              label: "Cache Hit Rate (%)",
              color: "hsl(var(--chart-4))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} interval="preserveStartEnd" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(value) => formatTime(value as string)} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="connections"
                stackId="1"
                stroke="var(--color-connections)"
                fill="var(--color-connections)"
                fillOpacity={0.6}
                name="Active Connections"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="queryTime"
                stackId="2"
                stroke="var(--color-queryTime)"
                fill="var(--color-queryTime)"
                fillOpacity={0.6}
                name="Query Time (ms)"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="slowQueries"
                stackId="3"
                stroke="var(--color-slowQueries)"
                fill="var(--color-slowQueries)"
                fillOpacity={0.6}
                name="Slow Queries"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cacheHitRate"
                stackId="4"
                stroke="var(--color-cacheHitRate)"
                fill="var(--color-cacheHitRate)"
                fillOpacity={0.6}
                name="Cache Hit Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
