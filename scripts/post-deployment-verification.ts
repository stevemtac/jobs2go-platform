async function verifyDeployment(baseUrl: string) {
  console.log("🔍 Post-Deployment Verification")
  console.log("=" * 50)

  const endpoints = [
    { name: "Health Check", url: `${baseUrl}/api/health`, critical: true },
    { name: "Complete Health", url: `${baseUrl}/api/health/complete`, critical: true },
    { name: "Deployment Health", url: `${baseUrl}/api/health/deployment`, critical: true },
    { name: "Email Test API", url: `${baseUrl}/api/test/email`, critical: false },
    { name: "Environment Debug", url: `${baseUrl}/debug/env`, critical: false },
    { name: "Monitoring Dashboard", url: `${baseUrl}/admin/monitoring`, critical: false },
  ]

  const results = []

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint.name}`)
      const response = await fetch(endpoint.url, {
        method: "GET",
        headers: {
          "User-Agent": "Jobs2Go-Deployment-Verification/1.0",
        },
      })

      const status = response.status
      const success = status >= 200 && status < 400

      console.log(`  Status: ${status} ${success ? "✅" : "❌"}`)

      if (endpoint.name === "Complete Health" && success) {
        const data = await response.json()
        console.log(`  Environment: ${data.environment}`)
        console.log(`  Version: ${data.version}`)
        console.log(`  Response Time: ${data.responseTime}`)
        console.log(`  Database: ${data.services.database}`)
        console.log(`  Email: ${data.services.email.provider}`)
        console.log(`  Monitoring: ${data.services.monitoring.sentry ? "✅" : "❌"}`)
      }

      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        status,
        success,
        critical: endpoint.critical,
      })
    } catch (error) {
      console.log(`  Error: ${error} ❌`)
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        status: 0,
        success: false,
        critical: endpoint.critical,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Summary
  console.log("\n📊 Verification Summary:")
  const criticalFailures = results.filter((r) => r.critical && !r.success)
  const totalTests = results.length
  const passedTests = results.filter((r) => r.success).length

  console.log(`  Total Tests: ${totalTests}`)
  console.log(`  Passed: ${passedTests} ✅`)
  console.log(`  Failed: ${totalTests - passedTests} ${totalTests - passedTests > 0 ? "❌" : ""}`)
  console.log(`  Critical Failures: ${criticalFailures.length} ${criticalFailures.length > 0 ? "❌" : "✅"}`)

  if (criticalFailures.length === 0) {
    console.log("\n🎉 ALL CRITICAL SYSTEMS OPERATIONAL!")
    console.log("Your Jobs2Go platform is ready for production use!")
  } else {
    console.log("\n⚠️  Critical issues detected:")
    criticalFailures.forEach((failure) => {
      console.log(`  - ${failure.endpoint}: ${failure.error || `Status ${failure.status}`}`)
    })
  }

  return {
    success: criticalFailures.length === 0,
    results,
    criticalFailures,
  }
}

// Usage example
const deploymentUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"
verifyDeployment(deploymentUrl)
  .then((result) => {
    if (result.success) {
      console.log("\n🚀 Deployment verification completed successfully!")
      process.exit(0)
    } else {
      console.log("\n❌ Deployment verification failed!")
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("Verification process failed:", error)
    process.exit(1)
  })
