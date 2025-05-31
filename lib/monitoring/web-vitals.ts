import { trackPerformance } from "./monitoring-service"
import { monitoringConfig } from "./config"
import type { NextWebVitalsMetric } from "next/app"

/**
 * Report Web Vitals metrics
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  const { name, value, id } = metric

  // Apply performance sampling
  if (Math.random() * 100 > monitoringConfig.sampling.performanceSampling) {
    return
  }

  // Determine severity based on thresholds
  let severity: "good" | "needs-improvement" | "poor" = "good"

  switch (name) {
    case "FCP":
      if (value > monitoringConfig.performanceThresholds.fcp.needsImprovement) {
        severity = "poor"
      } else if (value > monitoringConfig.performanceThresholds.fcp.good) {
        severity = "needs-improvement"
      }
      break
    case "LCP":
      if (value > monitoringConfig.performanceThresholds.lcp.needsImprovement) {
        severity = "poor"
      } else if (value > monitoringConfig.performanceThresholds.lcp.good) {
        severity = "needs-improvement"
      }
      break
    case "FID":
      if (value > monitoringConfig.performanceThresholds.fid.needsImprovement) {
        severity = "poor"
      } else if (value > monitoringConfig.performanceThresholds.fid.good) {
        severity = "needs-improvement"
      }
      break
    case "CLS":
      if (value > monitoringConfig.performanceThresholds.cls.needsImprovement) {
        severity = "poor"
      } else if (value > monitoringConfig.performanceThresholds.cls.good) {
        severity = "needs-improvement"
      }
      break
    case "TTFB":
      if (value > monitoringConfig.performanceThresholds.ttfb.needsImprovement) {
        severity = "poor"
      } else if (value > monitoringConfig.performanceThresholds.ttfb.good) {
        severity = "needs-improvement"
      }
      break
  }

  // Track the performance metric
  trackPerformance(name, value, {
    id,
    severity,
    metric: name,
  })

  // Send to analytics service if available
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, {
      event_category: "web-vitals",
      event_label: id,
      value: Math.round(name === "CLS" ? value * 1000 : value),
      non_interaction: true,
    })
  }
}
