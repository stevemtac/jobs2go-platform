"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Info } from "lucide-react"
import { getTemplateById } from "@/lib/error-monitoring/source-map-cleanup-templates"
import { toast } from "@/components/ui/use-toast"

// Form schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  retentionDays: z.coerce.number().int().min(1, {
    message: "Retention days must be at least 1.",
  }),
  minVersionsToKeep: z.coerce.number().int().min(1, {
    message: "Minimum versions to keep must be at least 1.",
  }),
  cronSchedule: z.string().min(9, {
    message: "Please provide a valid cron schedule.",
  }),
  dryRun: z.boolean().default(false),
  deleteFromStorage: z.boolean().default(true),
  deleteFromDatabase: z.boolean().default(true),
  notifyOnCompletion: z.boolean().default(true),
  notificationChannels: z.array(z.string()).default([]),
  templateId: z.string().optional(),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface CleanupScheduleFormProps {
  scheduleId?: string
  defaultValues?: Partial<FormValues>
  isEdit?: boolean
}

export function CleanupScheduleForm({ scheduleId, defaultValues, isEdit = false }: CleanupScheduleFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null)

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      retentionDays: 30,
      minVersionsToKeep: 5,
      cronSchedule: "0 3 * * *", // 3 AM daily
      dryRun: false,
      deleteFromStorage: true,
      deleteFromDatabase: true,
      notifyOnCompletion: true,
      notificationChannels: ["email"],
      templateId: "",
      isActive: true,
    },
  })

  // Apply template if specified in URL
  useEffect(() => {
    const templateId = searchParams.get("template")
    if (templateId && !isEdit) {
      const template = getTemplateById(templateId)
      if (template) {
        form.reset({
          name: `${template.name} Schedule`,
          description: template.description,
          retentionDays: template.settings.retentionDays,
          minVersionsToKeep: template.settings.minVersionsToKeep,
          cronSchedule: template.settings.cronSchedule,
          dryRun: template.settings.dryRun,
          deleteFromStorage: template.settings.deleteFromStorage,
          deleteFromDatabase: template.settings.deleteFromDatabase,
          notifyOnCompletion: template.settings.notifyOnCompletion,
          notificationChannels: template.settings.notificationChannels,
          templateId: template.id,
          isActive: true,
        })
        setAppliedTemplate(template.name)
      }
    }
  }, [searchParams, isEdit, form])

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      const endpoint = isEdit
        ? `/api/admin/source-maps/cleanup-schedules/${scheduleId}`
        : "/api/admin/source-maps/cleanup-schedules"

      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save schedule")
      }

      toast({
        title: isEdit ? "Schedule updated" : "Schedule created",
        description: isEdit
          ? "Your cleanup schedule has been updated successfully."
          : "Your cleanup schedule has been created successfully.",
      })

      router.push("/admin/source-maps/cleanup-schedules")
      router.refresh()
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide basic information about this cleanup schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appliedTemplate && (
              <div className="mb-4 flex items-center">
                <Badge variant="outline" className="mr-2">
                  Template
                </Badge>
                <span className="text-sm">
                  Using the <strong>{appliedTemplate}</strong> template
                </span>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekly Cleanup" {...field} />
                  </FormControl>
                  <FormDescription>A descriptive name for this cleanup schedule</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekly cleanup of old source maps" {...field} />
                  </FormControl>
                  <FormDescription>Optional description of this cleanup schedule</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Enable or disable this cleanup schedule</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cleanup Settings</CardTitle>
            <CardDescription>Configure how source maps should be cleaned up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="retentionDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retention Days</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Source maps older than this many days will be cleaned up</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minVersionsToKeep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Versions to Keep</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Always keep at least this many recent versions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cronSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron Schedule</FormLabel>
                  <FormControl>
                    <Input placeholder="0 3 * * *" {...field} />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    <span>Cron expression for when to run this cleanup (e.g., "0 3 * * *" for daily at 3 AM)</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dryRun"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Dry Run</FormLabel>
                      <FormDescription>Simulate cleanup without actually deleting files</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deleteFromStorage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Delete from Storage</FormLabel>
                      <FormDescription>Delete source map files from S3 storage</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={form.watch("dryRun")} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deleteFromDatabase"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Delete from Database</FormLabel>
                    <FormDescription>Delete source map records from the database</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={form.watch("dryRun")} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure notifications for cleanup completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notifyOnCompletion"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Notify on Completion</FormLabel>
                    <FormDescription>Send notifications when cleanup is completed</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationChannels"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Notification Channels</FormLabel>
                    <FormDescription>Select channels to receive notifications</FormDescription>
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="notificationChannels"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("email")}
                              onCheckedChange={(checked) => {
                                const currentValue = [...(field.value || [])]
                                if (checked) {
                                  if (!currentValue.includes("email")) {
                                    field.onChange([...currentValue, "email"])
                                  }
                                } else {
                                  field.onChange(currentValue.filter((value) => value !== "email"))
                                }
                              }}
                              disabled={!form.watch("notifyOnCompletion")}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Email</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notificationChannels"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("slack")}
                              onCheckedChange={(checked) => {
                                const currentValue = [...(field.value || [])]
                                if (checked) {
                                  if (!currentValue.includes("slack")) {
                                    field.onChange([...currentValue, "slack"])
                                  }
                                } else {
                                  field.onChange(currentValue.filter((value) => value !== "slack"))
                                }
                              }}
                              disabled={!form.watch("notifyOnCompletion")}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Slack</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden field for templateId */}
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => <input type="hidden" {...field} />}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/source-maps/cleanup-schedules")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Schedule" : "Create Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
