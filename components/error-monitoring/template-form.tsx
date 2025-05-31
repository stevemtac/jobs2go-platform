"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
  dayOfWeek: z.number().min(0).max(6).optional().nullable(),
  dayOfMonth: z.number().min(1).max(31).optional().nullable(),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  retentionDays: z.number().min(1),
  minDeploymentsToKeep: z.number().min(1),
  dryRun: z.boolean().default(false),
  storageProvider: z.string(),
  notifyOnSuccess: z.boolean().default(true),
  notifyOnFailure: z.boolean().default(true),
  notificationRecipients: z.array(z.string()),
  tags: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

const availableTags = [
  "daily",
  "weekly",
  "monthly",
  "aggressive",
  "balanced",
  "conservative",
  "development",
  "production",
  "custom",
]

interface TemplateFormProps {
  initialData?: any
  isEditing?: boolean
}

export function TemplateForm({ initialData, isEditing = false }: TemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<FormValues> = {
    name: "",
    description: "",
    frequency: "DAILY",
    dayOfWeek: null,
    dayOfMonth: null,
    hour: 1,
    minute: 0,
    retentionDays: 7,
    minDeploymentsToKeep: 5,
    dryRun: false,
    storageProvider: "s3",
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notificationRecipients: [],
    tags: ["custom"],
    ...initialData,
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const frequency = form.watch("frequency")

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      const url = isEditing ? `/api/admin/source-maps/templates/${initialData.id}` : "/api/admin/source-maps/templates"

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save template")
      }

      toast({
        title: isEditing ? "Template updated" : "Template created",
        description: isEditing
          ? "Your template has been updated successfully."
          : "Your template has been created successfully.",
      })

      router.push("/admin/source-maps/templates")
      router.refresh()
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide basic information about your template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Production Weekly Cleanup" {...field} />
                  </FormControl>
                  <FormDescription>A descriptive name for your template</FormDescription>
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
                    <Textarea
                      placeholder="Describe the purpose and use case for this template"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Explain when and why this template should be used</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Tags</FormLabel>
                    <FormDescription>Select tags to categorize this template</FormDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <FormField
                        key={tag}
                        control={form.control}
                        name="tags"
                        render={({ field }) => {
                          return (
                            <FormItem key={tag} className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(tag)}
                                  disabled={tag === "custom"}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, tag])
                                      : field.onChange(field.value?.filter((value) => value !== tag))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{tag}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Configuration</CardTitle>
            <CardDescription>Configure when the cleanup should run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How often the cleanup should run</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency === "WEEKLY" && (
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value?.toString() || "0"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Which day of the week the cleanup should run</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "MONTHLY" && (
              <FormField
                control={form.control}
                name="dayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Month</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value?.toString() || "1"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Which day of the month the cleanup should run</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hour</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hour" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Hour in 24-hour format (UTC)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minute</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select minute" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0, 15, 30, 45].map((minute) => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {minute.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Minute (0, 15, 30, or 45)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cleanup Configuration</CardTitle>
            <CardDescription>Configure how the cleanup should work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="retentionDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retention Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Number of days to keep source maps before deletion</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minDeploymentsToKeep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Deployments to Keep</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Minimum number of recent deployments to keep regardless of age</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storageProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="s3">AWS S3</SelectItem>
                      <SelectItem value="local">Local Storage</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Where the source maps are stored</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dryRun"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Dry Run</FormLabel>
                    <FormDescription>Simulate cleanup without actually deleting files</FormDescription>
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
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure notifications for cleanup operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notifyOnSuccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notify on Success</FormLabel>
                    <FormDescription>Send notification when cleanup completes successfully</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyOnFailure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notify on Failure</FormLabel>
                    <FormDescription>Send notification when cleanup fails</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
