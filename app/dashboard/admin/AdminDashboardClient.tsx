"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  CalendarDays,
  Activity,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react"
import { StatCard } from "./stat-card"

type Role = "patient" | "therapist" | "admin"

interface UserRow {
  id: number
  email: string
  fullName: string
  role: Role
  phoneNumber: string | null
  createdAt: string
  verificationStatus: "Pending" | "Verified" | "Rejected" | null
  specialization: string | null
  consultationFee: number | null
}

interface ActivityRow {
  id: string
  activityType: string
  deviceInfo: string | null
  ipAddress: string
  loggedAt: string
  user: { id: number; fullName: string; email: string; role: Role } | null
}

interface Stats {
  totalUsers: number
  byRole: { patient: number; therapist: number; admin: number }
  totalSessions: number
  totalActivities: number
}

const roleColors: Record<Role, string> = {
  patient: "bg-blue-100 text-blue-800 border-blue-200",
  therapist: "bg-green-100 text-green-800 border-green-200",
  admin: "bg-purple-100 text-purple-800 border-purple-200",
}

const verificationColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Verified: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
}

const activityTypeLabels: Record<string, { label: string; className: string }> = {
  LOGIN: { label: "Login", className: "bg-blue-100 text-blue-800 border-blue-200" },
  LOGOUT: { label: "Logout", className: "bg-gray-100 text-gray-800 border-gray-200" },
  REGISTER: { label: "Register", className: "bg-green-100 text-green-800 border-green-200" },
  UPDATE_PROFILE: { label: "Profile Update", className: "bg-orange-100 text-orange-800 border-orange-200" },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function AdminDashboardClient() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>("all") // Filter on Users tab

  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [activitiesTotal, setActivitiesTotal] = useState(0)
  const [activitiesPage, setActivitiesPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Derived state for pending verifications from the users list is tricky if paginated.
  // We'll rely on what we have loaded or fetch specifically for verification tab if needed.
  // For this implementation, we'll assume the Verification tab might need its own fetch or we filter loaded users.
  // Since we don't have a dedicated verification endpoint, lets just filter the loaded users for now.
  // Ideally we should have a separate fetch for pending users.
  const pendingVerifications = users.filter(
    (u) => u.role === "therapist" && u.verificationStatus === "Pending"
  )

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login")
      return
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/")
      return
    }
    if (status !== "authenticated") return

    const roleParam = usersRoleFilter !== "all" ? `&role=${usersRoleFilter}` : ""

    setLoading(true)
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch(`/api/admin/users?page=${usersPage}&limit=20${roleParam}`).then((r) => r.json()),
      fetch(`/api/admin/activities?page=${activitiesPage}&limit=20`).then((r) => r.json()),
    ])
      .then(([statsRes, usersRes, activitiesRes]) => {
        if (statsRes.error) setForbidden(true)
        else setStats(statsRes)

        if (usersRes.error) setForbidden(true)
        else {
          setUsers(usersRes.users ?? [])
          setUsersTotal(usersRes.total ?? 0)
          // usersPage is controlled state, trust the response page if needed or keep local
        }

        if (activitiesRes.error) setForbidden(true)
        else {
          setActivities(activitiesRes.activities ?? [])
          setActivitiesTotal(activitiesRes.total ?? 0)
        }
      })
      .catch(() => setForbidden(true))
      .finally(() => setLoading(false))
  }, [status, session?.user?.role, router, usersPage, activitiesPage, usersRoleFilter])

  function handleUpdateUser(userId: number, field: "role" | "verificationStatus", value: string) {
    setUpdatingUserId(userId)
    fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId
                ? {
                  ...u,
                  role: data.role ?? u.role,
                  verificationStatus: data.verificationStatus ?? u.verificationStatus,
                }
                : u
            )
          )
        }
      })
      .finally(() => setUpdatingUserId(null))
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="p-6">
        <p className="text-destructive">You do not have access to this page.</p>
      </div>
    )
  }

  const totalPagesUsers = Math.ceil(usersTotal / 20)
  const totalPagesActivities = Math.ceil(activitiesTotal / 20)

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage users, sessions, and platform activity.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          subtitle="Registered users"
        />
        <StatCard
          title="Patients"
          value={stats?.byRole.patient ?? 0}
          icon={Users}
          iconClassName="text-blue-600 bg-blue-100"
        />
        <StatCard
          title="Therapists"
          value={stats?.byRole.therapist ?? 0}
          icon={UserCheck}
          iconClassName="text-green-600 bg-green-100"
        />
        <StatCard
          title="Total Sessions"
          value={stats?.totalSessions ?? 0}
          icon={CalendarDays}
          iconClassName="text-orange-600 bg-orange-100"
        />
        {/* <StatCard
          title="Activities"
          value={stats?.totalActivities ?? 0}
          icon={Activity}
          iconClassName="text-purple-600 bg-purple-100"
        /> */}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="verification">
            Verification
            {pendingVerifications.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 rounded-full px-1.5 text-xs text-none">
                {pendingVerifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and roles.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-[200px] lg:w-[300px]"
                    />
                  </div>
                  <Select value={usersRoleFilter} onValueChange={setUsersRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("capitalize font-normal", roleColors[user.role])}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'therapist' ? (
                            <Badge variant="outline" className={cn("capitalize font-normal", user.verificationStatus ? verificationColors[user.verificationStatus] : "")}>
                              {user.verificationStatus || 'N/A'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {/* Actions can go here */}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination for Users */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  disabled={usersPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {usersPage} of {totalPagesUsers || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUsersPage((p) => Math.min(totalPagesUsers, p + 1))}
                  disabled={usersPage >= totalPagesUsers}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Review therapist verification requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVerifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending verifications.</p>
                ) : (
                  pendingVerifications.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">Specialization: {user.specialization || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleUpdateUser(user.id, "verificationStatus", "Rejected")}>
                          <UserX className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => handleUpdateUser(user.id, "verificationStatus", "Verified")}>
                          <UserCheck className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent system activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">IP Address</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No activities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {activity.user ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">{getInitials(activity.user.fullName)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{activity.user.fullName}</span>
                            </div>
                          ) : <span className="text-muted-foreground">Unknown</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-normal", activityTypeLabels[activity.activityType]?.className)}>
                            {activityTypeLabels[activity.activityType]?.label || activity.activityType}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">{activity.ipAddress}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.loggedAt).toLocaleString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination for Activities */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivitiesPage((p) => Math.max(1, p - 1))}
                  disabled={activitiesPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {activitiesPage} of {totalPagesActivities || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivitiesPage((p) => Math.min(totalPagesActivities, p + 1))}
                  disabled={activitiesPage >= totalPagesActivities}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
