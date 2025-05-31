"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Calendar, Clock, Trash2, Edit, Play, Pause, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface CleanupSchedule {
  id: string
  name: string
  description?: string
  frequency: "DAILY" | "WEEKLY" | "MONTHLY"
  dayOfWeek?: number
  dayOfMonth?: number
  hour: number
  minute: number
  retentionDays: number
  minDeploymentsToKeep: number
  isActive: boolean
  lastRun?: string
  nextRun?: string
  createdAt: string
  templateId?: string
  templateName?: string
  dryRun: boolean
}

interface CleanupScheduleListProps {
  initialSchedules?: CleanupSchedule[]
  showActions?: boolean
  limit?: number
  showPagination?: boolean
}

export function CleanupScheduleList({
  initialSchedules,
  showActions = true,
  limit = 10,
  showPagination = true,
}: CleanupScheduleListProps) {
  const [schedules, setSchedules] = useState<CleanupSchedule[]>(initialSchedules || [])
  const [loading, setLoading] = useState(!initialSchedules)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    if (!initialSchedules) {
      fetchSchedules()
    }
  }, [initialSchedules, page])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/source-maps/cleanup-schedules?page=${page}&limit=${limit}`)

      if (!response.ok) {
        throw new Error("Failed to fetch cleanup schedules")
      }

      const data = await response.json()
      setSchedules(data.schedules)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching cleanup schedules:", error)
      toast({
        title: "Error",
        description: "Failed to load cleanup schedules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleScheduleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/source-maps/cleanup-schedules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update schedule status")
      }

      setSchedules(
        schedules.map((schedule) => (schedule.id === id ? { ...schedule, isActive: !currentStatus } : schedule)),
      )

      toast({
        title: "Success",
        description: `Schedule ${!currentStatus ? "activated" : "paused"} successfully`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating schedule status:", error)
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive",
      })
    }
  }

  const runScheduleNow = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/source-maps/cleanup-schedules/${id}/run`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to run schedule")
      }

      toast({
        title: "Success",
        description: "Schedule execution started",
        variant: "default",
      })
    } catch (error) {
      console.error("Error running schedule:", error)
      toast({
        title: "Error",
        description: "Failed to run schedule",
        variant: "destructive",
      })
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/source-maps/cleanup-schedules/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete schedule")
      }

      setSchedules(schedules.filter((schedule) => schedule.id !== id))

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      })
    }
  }

  const formatScheduleTime = (schedule: CleanupSchedule) => {
    const { frequency, dayOfWeek, dayOfMonth, hour, minute } = schedule

    let timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

    if (frequency === "WEEKLY" && dayOfWeek !== undefined) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      timeString = `${days[dayOfWeek]} at ${timeString}`
    } else if (frequency === "MONTHLY" && dayOfMonth !== undefined) {
      timeString = `Day ${dayOfMonth} at ${timeString}`
    }

    return timeString
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Cleanup Schedules</CardTitle>
          <CardDescription>No source map cleanup schedules have been created yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No schedules found</p>
            <p className="text-sm text-muted-foreground">Create a new schedule to automate source map cleanup.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/admin/source-maps/cleanup-schedules/new">Create Schedule</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Retention</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{schedule.name}</div>
                  {schedule.templateName && (
                    <Badge variant="outline" className="mt-1">
                      Template: {schedule.templateName}
                    </Badge>
                  )}
                  {schedule.dryRun && (
                    <Badge variant="secondary" className="ml-2 mt-1">
                      Dry Run
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{schedule.frequency.charAt(0) + schedule.frequency.slice(1).toLowerCase()}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <Clock className="inline-block mr-1 h-3 w-3" />
                  {formatScheduleTime(schedule)}
                </div>
              </TableCell>
              <TableCell>
                <div>{schedule.retentionDays} days</div>
                <div className="text-xs text-muted-foreground">Min {schedule.minDeploymentsToKeep} deployments</div>
              </TableCell>
              <TableCell>
                <Badge variant={schedule.isActive ? "default" : "secondary"}>
                  {schedule.isActive ? "Active" : "Paused"}
                </Badge>
              </TableCell>
              <TableCell>
                {schedule.lastRun ? (
                  <div>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(schedule.lastRun), { addSuffix: true })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Next:{" "}
                      {schedule.nextRun ? formatDistanceToNow(new Date(schedule.nextRun), { addSuffix: true }) : "N/A"}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Never run</span>
                )}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleScheduleStatus(schedule.id, schedule.isActive)}
                      title={schedule.isActive ? "Pause schedule" : "Activate schedule"}
                    >
                      {schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => runScheduleNow(schedule.id)} title="Run now">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild title="Edit schedule">
                      <Link href={`/admin/source-maps/cleanup-schedules/${schedule.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteSchedule(schedule.id)}
                      title="Delete schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <div className="flex items-center px-4">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
