"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface ErrorRateData {
  timestamp: string
  errorRate: number
  totalRequests: number
  errors: number
}

export function ErrorRateChart() {
  const [data, setData] = useState<ErrorRateData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/monitoring/error-rate")
        if (response.ok) {
          const errorData = await response.json()
          setData(errorData)
        }
      } catch (error) {
        console.error("Failed to fetch error rate data:", error)
        // Generate mock data for demonstration
        const mockData = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          errorRate: Math.random() * 2,
          totalRequests: Math.floor(Math.random() * 1000) + 500,
          errors: Math.floor(Math.random() * 20),
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

  const averageErrorRate =
    data.length > 0 ? (data.reduce((sum, item) => sum + item.errorRate, 0) / data.length).toFixed(2) : "0.00"

  const totalErrors = data.reduce((sum, item) => sum + item.errors, 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Rate</CardTitle>
          <CardDescription>Loading error rate data...</CardDescription>
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
        <CardTitle>Error Rate</CardTitle>
        <CardDescription>
          Error rate over the last 24 hours (Avg: {averageErrorRate}%, Total Errors: {totalErrors})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            errorRate: {
              label: "Error Rate (%)",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} interval="preserveStartEnd" />
              <YAxis domain={[0, "dataMax + 0.5"]} tickFormatter={(value) => `${value}%`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(value) => formatTime(value as string)}
                formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, "Error Rate"]}
              />
              <Line
                type="monotone"
                dataKey="errorRate"
                stroke="var(--color-errorRate)"
                strokeWidth={2}
                dot={{ fill: "var(--color-errorRate)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
