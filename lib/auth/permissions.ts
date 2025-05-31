import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

/**
 * Permission types for the application
 */
export type Permission =
  | "admin:access"
  | "templates:read"
  | "templates:write"
  | "templates:delete"
  | "sourcemaps:read"
  | "sourcemaps:write"
  | "sourcemaps:delete"
  | "audit:read"
  | "users:read"
  | "users:write"
  | "roles:read"
  | "roles:write"

/**
 * Interface for a role with permissions
 */
interface Role {
  id: string
  name: string
  permissions: Permission[]
}

/**
 * Interface for a user with roles
 */
interface User {
  id: string
  email: string
  roles: Role[]
}

/**
 * Cache for user permissions to reduce database queries
 */
const permissionCache = new Map<string, { permissions: Set<Permission>; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Checks if the current user has the specified permission
 *
 * @param permission The permission to check
 * @param userId Optional user ID to check permissions for (defaults to current user)
 * @returns A promise that resolves to a boolean indicating if the user has the permission
 */
export async function hasPermission(permission: Permission, userId?: string): Promise<boolean> {
  try {
    // Get the current user from the session if userId is not provided
    let userIdToCheck = userId

    if (!userIdToCheck) {
      const session = await getServerSession(authOptions)
      userIdToCheck = session?.user?.id

      if (!userIdToCheck) {
        return false // No authenticated user
      }
    }

    // Check cache first
    const cacheKey = `${userIdToCheck}`
    const cachedData = permissionCache.get(cacheKey)
    const now = Date.now()

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      return cachedData.permissions.has(permission)
    }

    // Fetch user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: userIdToCheck },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return false
    }

    // Extract permissions from user roles
    const userPermissions = new Set<Permission>()

    for (const userRole of user.roles) {
      for (const rolePermission of userRole.role.permissions) {
        userPermissions.add(rolePermission.permission.name as Permission)
      }
    }

    // Update cache
    permissionCache.set(cacheKey, {
      permissions: userPermissions,
      timestamp: now,
    })

    return userPermissions.has(permission)
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

/**
 * Gets all permissions for a user
 *
 * @param userId The user ID to get permissions for
 * @returns A promise that resolves to an array of permissions
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    // Check cache first
    const cacheKey = `${userId}`
    const cachedData = permissionCache.get(cacheKey)
    const now = Date.now()

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      return Array.from(cachedData.permissions)
    }

    // Fetch user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return []
    }

    // Extract permissions from user roles
    const userPermissions = new Set<Permission>()

    for (const userRole of user.roles) {
      for (const rolePermission of userRole.role.permissions) {
        userPermissions.add(rolePermission.permission.name as Permission)
      }
    }

    // Update cache
    permissionCache.set(cacheKey, {
      permissions: userPermissions,
      timestamp: now,
    })

    return Array.from(userPermissions)
  } catch (error) {
    console.error("Error getting user permissions:", error)
    return []
  }
}

/**
 * Clears the permission cache for a user
 *
 * @param userId The user ID to clear the cache for
 */
export function clearPermissionCache(userId: string): void {
  permissionCache.delete(`${userId}`)
}

/**
 * Middleware to check if a user has the required permission
 *
 * @param permission The permission to check
 * @returns A middleware function that checks the permission
 */
export function requirePermission(permission: Permission) {
  return async (req: Request) => {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const hasRequiredPermission = await hasPermission(permission, userId)

    if (!hasRequiredPermission) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return null // Continue to the next middleware or handler
  }
}
