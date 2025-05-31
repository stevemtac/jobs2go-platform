import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { DeploymentVerificationContent } from "@/components/admin/deployment-verification-content"

export const metadata = {
  title: "Deployment Verification",
  description: "Verify that the application is deployed correctly",
}

export default function DeploymentVerificationPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Deployment Verification</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Export Verification</CardTitle>
            <CardDescription>Verify that all required module exports are available</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-6">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              }
            >
              <DeploymentVerificationContent />
            </Suspense>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/deployment-verification?refresh=true">Refresh Check</Link>
            </Button>
          </CardFooter>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Deployment Verification</AlertTitle>
          <AlertDescription>
            This page helps verify that the application is deployed correctly. If all checks pass, the application
            should be functioning properly.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
