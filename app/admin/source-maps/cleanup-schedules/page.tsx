import type { Metadata } from "next"
import CleanupSchedulesClient from "./cleanup-schedules-client"

export const metadata: Metadata = {
  title: "Source Map Cleanup Schedules",
  description: "Manage scheduled cleanup of source maps",
}

export default function CleanupSchedulesPage() {
  return <CleanupSchedulesClient />
}
