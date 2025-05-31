import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonitoringDashboard } from "@/components/monitoring/monitoring-dashboard"
import { ErrorRateChart } from "@/components/monitoring/error-rate-chart"
import { PerformanceMetricsChart } from "@/components/monitoring/performance-metrics-chart"
import { DatabaseMetricsChart } from "@/components/monitoring/database-metrics-chart"
import { SystemHealthStatus } from "@/components/monitoring/system-health-status"
import { AlertsLog } from "@/components/monitoring/alerts-log"

export const metadata = {
  title: "Monitoring Dashboard",
  description: "Monitor the health and performance of your Jobs2go platform",
}

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Monitoring Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current health status of all systems</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading system health...</div>}>
                  <SystemHealthStatus />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>Error rate over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading error rate...</div>}>
                  <ErrorRateChart />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Key performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading performance metrics...</div>}>
                  <PerformanceMetricsChart />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Suspense fallback={<div>Loading performance dashboard...</div>}>
            <MonitoringDashboard type="performance" />
          </Suspense>
        </TabsContent>

        <TabsContent value="errors">
          <Suspense fallback={<div>Loading error dashboard...</div>}>
            <MonitoringDashboard type="errors" />
          </Suspense>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Metrics</CardTitle>
              <CardDescription>Database performance and health</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading database metrics...</div>}>
                <DatabaseMetricsChart />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Alerts triggered in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading alerts...</div>}>
                <AlertsLog />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
