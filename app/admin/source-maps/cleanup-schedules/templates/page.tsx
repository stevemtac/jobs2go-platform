import type { Metadata } from "next"
import CleanupTemplatesClient from "./cleanup-templates-client"

export const metadata: Metadata = {
  title: "Source Map Cleanup Templates",
  description: "Select a predefined template for source map cleanup",
}

export default function CleanupTemplatesPage() {
  return <CleanupTemplatesClient />
}
