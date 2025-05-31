"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

interface PerformanceData {
  timestamp: string
  responseTime: number
  throughput: number
  cpuUsage: number
  memoryUsage: number
}

export function PerformanceMetricsChart() {
  const [data, setData] = useState<PerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/monitoring/performance")
        if (response.ok) {
          const perfData = await response.json()
          setData(perfData)
        }
      } catch (error) {
        console.error("Failed to fetch performance data:", error)
        // Generate mock data for demonstration
        const mockData = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          responseTime: Math.random() * 500 + 100,
          throughput: Math.random() * 1000 + 500,
          cpuUsage: Math.random() * 80 + 10,
          memoryUsage: Math.random() * 70 + 20,
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

  const averageResponseTime =
    data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.responseTime, 0) / data.length) : 0

  const averageThroughput =
    data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.throughput, 0) / data.length) : 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Loading performance data...</CardDescription>
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
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          System performance over the last 24 hours (Avg Response: {averageResponseTime}ms, Avg Throughput:{" "}
          {averageThroughput} req/min)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            responseTime: {
              label: "Response Time (ms)",
              color: "hsl(var(--chart-1))",
            },
            throughput: {
              label: "Throughput (req/min)",
              color: "hsl(var(--chart-2))",
            },
            cpuUsage: {
              label: "CPU Usage (%)",
              color: "hsl(var(--chart-3))",
            },
            memoryUsage: {
              label: "Memory Usage (%)",
              color: "hsl(var(--chart-4))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} interval="preserveStartEnd" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(value) => formatTime(value as string)} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="responseTime"
                stroke="var(--color-responseTime)"
                strokeWidth={2}
                name="Response Time (ms)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="throughput"
                stroke="var(--color-throughput)"
                strokeWidth={2}
                name="Throughput (req/min)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cpuUsage"
                stroke="var(--color-cpuUsage)"
                strokeWidth={2}
                name="CPU Usage (%)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="memoryUsage"
                stroke="var(--color-memoryUsage)"
                strokeWidth={2}
                name="Memory Usage (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
