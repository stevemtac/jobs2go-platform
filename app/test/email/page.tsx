"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, AlertTriangle, Loader2 } from "lucide-react"

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState("")
  const [customEmail, setCustomEmail] = useState({
    to: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runEmailTest = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch(`/api/test/email?email=${encodeURIComponent(testEmail)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        error: "Failed to run email test",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendCustomEmail = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/test/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customEmail),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        error: "Failed to send custom email",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📧 Email Configuration Test</h1>
        <p className="text-muted-foreground">
          Test your email configuration after deployment to ensure everything is working correctly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Quick Email Test
            </CardTitle>
            <CardDescription>Send a test email to verify your email configuration is working.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button onClick={runEmailTest} disabled={loading || !testEmail} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Run Email Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Custom Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Custom Email Test
            </CardTitle>
            <CardDescription>Send a custom email with your own content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customTo">To</Label>
              <Input
                id="customTo"
                type="email"
                placeholder="recipient@example.com"
                value={customEmail.to}
                onChange={(e) => setCustomEmail({ ...customEmail, to: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customSubject">Subject</Label>
              <Input
                id="customSubject"
                placeholder="Test email subject"
                value={customEmail.subject}
                onChange={(e) => setCustomEmail({ ...customEmail, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customMessage">Message</Label>
              <Textarea
                id="customMessage"
                placeholder="Your test message..."
                value={customEmail.message}
                onChange={(e) => setCustomEmail({ ...customEmail, message: e.target.value })}
                rows={3}
              />
            </div>
            <Button
              onClick={sendCustomEmail}
              disabled={loading || !customEmail.to || !customEmail.subject || !customEmail.message}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Custom Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={results.success ? "border-green-200" : "border-red-200"}>
              <AlertDescription>
                {results.success ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-700">✅ Email test completed successfully!</p>
                    {results.results && (
                      <div className="text-sm space-y-1">
                        <p>Email sent: {results.results.emailSent ? "✅ Yes" : "❌ No"}</p>
                        <p>Alert sent: {results.results.alertSent ? "✅ Yes" : "❌ No"}</p>
                        <p>
                          Provider: <Badge variant="outline">{results.results.provider}</Badge>
                        </p>
                        <p>Timestamp: {new Date(results.results.timestamp).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-red-700">❌ Email test failed</p>
                    <p className="text-sm text-red-600">{results.error}</p>
                    {results.provider && (
                      <p className="text-sm">
                        Provider: <Badge variant="outline">{results.provider}</Badge>
                      </p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">After Deployment:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Visit this page on your deployed application</li>
              <li>Enter your email address in the quick test</li>
              <li>Click "Run Email Test" to verify configuration</li>
              <li>Check your inbox for the test emails</li>
              <li>Verify both regular and alert emails are received</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">What Gets Tested:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Environment variable configuration</li>
              <li>Resend API integration (if configured)</li>
              <li>SMTP fallback functionality</li>
              <li>Email formatting and delivery</li>
              <li>Alert email system</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
