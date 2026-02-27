"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  LayoutDashboard,
  CircleUser,
  LogOut,
  Menu,
  Bell,
  Check,
  CheckCheck,
  Calendar,
  UserCheck,
  CreditCard,
  Info,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Role = "patient" | "therapist" | "admin"

interface Notification {
  notification_id: number
  notificationType: "booking_request" | "session_accepted" | "payment_success" | "general"
  message: string
  readStatus: boolean
  createdAt: string
}

interface NavbarProps {
  user?: {
    name: string
    email: string
    role: Role
    avatarUrl?: string
  } | null
}

const HIDE_NAVBAR_PATHS = ["/auth/login", "/auth/register"]

const dashboardPathByRole: Record<Role, string> = {
  patient: "/dashboard/patient",
  therapist: "/dashboard/therapist",
  admin: "/dashboard/admin",
}

const profilePathByRole: Partial<Record<Role, string>> = {
  patient: "/dashboard/patient/profile",
  therapist: "/dashboard/therapist/profile",
}

const getNotificationIcon = (type: Notification["notificationType"]) => {
  switch (type) {
    case "booking_request":
      return Calendar
    case "session_accepted":
      return UserCheck
    case "payment_success":
      return CreditCard
    default:
      return Info
  }
}

const getNotificationColor = (type: Notification["notificationType"]) => {
  switch (type) {
    case "booking_request":
      return "text-blue-500 bg-blue-500/10"
    case "session_accepted":
      return "text-green-500 bg-green-500/10"
    case "payment_success":
      return "text-emerald-500 bg-emerald-500/10"
    default:
      return "text-gray-500 bg-gray-500/10"
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count")
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readStatus: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notificationId ? { ...n, readStatus: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all", {
        method: "PATCH",
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readStatus: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const deleteNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const wasUnread = notifications.find(n => n.notification_id === notificationId)?.readStatus === false
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        )
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  if (pathname && HIDE_NAVBAR_PATHS.includes(pathname)) {
    return null
  }

  const role = user?.role
  const dashboardPath = role ? dashboardPathByRole[role] : null
  const profilePath = role ? profilePathByRole[role] : null

  const navLinks = [
    ...(dashboardPath
      ? [{ href: dashboardPath, label: "Dashboard", icon: LayoutDashboard }]
      : []),
  ]

  const isActive = (href: string) => pathname === href

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            Lumivia
          </span>
        </Link>



        {/* Right Side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative hidden md:flex hover:bg-accent"
                  >
                    <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <>
                        <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1 text-[10px] font-bold bg-primary text-primary-foreground border-2 border-card shadow-sm animate-in zoom-in-50">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 animate-ping bg-primary rounded-full opacity-75"></span>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  align="end" 
                  className="w-[380px] p-0 max-h-[500px] overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <DropdownMenuLabel className="p-0 text-sm font-semibold">
                        Notifications
                      </DropdownMenuLabel>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-7 px-2 text-xs hover:bg-accent"
                      >
                        <CheckCheck className="h-3.5 w-3.5 mr-1" />
                        Mark all read
                      </Button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <ScrollArea className="h-[400px]">
                    {isLoadingNotifications ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                          <Bell className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          No notifications yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          We'll notify you when something arrives
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => {
                          const Icon = getNotificationIcon(notification.notificationType)
                          const colorClass = getNotificationColor(notification.notificationType)
                          
                          return (
                            <div
                              key={notification.notification_id}
                              className={cn(
                                "group relative px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer",
                                !notification.readStatus && "bg-primary/5"
                              )}
                              onClick={() => !notification.readStatus && markAsRead(notification.notification_id)}
                            >
                              <div className="flex gap-3">
                                {/* Icon */}
                                <div className={cn("flex-shrink-0 rounded-full p-2 h-9 w-9 flex items-center justify-center", colorClass)}>
                                  <Icon className="h-4 w-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className={cn(
                                    "text-sm leading-snug",
                                    !notification.readStatus ? "font-medium text-foreground" : "text-muted-foreground"
                                  )}>
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">
                                      {formatTimeAgo(notification.createdAt)}
                                    </p>
                                    {!notification.readStatus && (
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notification.readStatus && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(notification.notification_id)
                                      }}
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => deleteNotification(notification.notification_id, e)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Footer */}
                  {/* {notifications.length > 0 && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        className="w-full text-xs font-medium hover:bg-accent"
                        onClick={() => {
                          // Navigate to notifications page if you have one
                          console.log("View all notifications")
                        }}
                      >
                        View all notifications
                      </Button>
                    </div>
                  )} */}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hidden md:flex">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-medium leading-none text-foreground">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator />

                  {dashboardPath && (
                    <DropdownMenuItem asChild>
                      <Link href={dashboardPath} className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {profilePath && (
                    <DropdownMenuItem asChild>
                      <Link href={profilePath} className="gap-2">
                        <CircleUser className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-72 p-0">
                  <div className="flex flex-col h-full">

                    <div className="flex items-center gap-3 border-b border-border px-6 py-5">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>

                    <nav className="flex-1 px-3 py-4">
                      <div className="flex flex-col gap-1">
                        {/* Mobile Notifications */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">Notifications</span>
                              {unreadCount > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            {unreadCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-7 px-2 text-xs"
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-1 px-2">
                            {notifications.length === 0 ? (
                              <div className="text-center py-6 px-4">
                                <p className="text-xs text-muted-foreground">No notifications</p>
                              </div>
                            ) : (
                              notifications.slice(0, 5).map((notification) => {
                                const Icon = getNotificationIcon(notification.notificationType)
                                const colorClass = getNotificationColor(notification.notificationType)
                                
                                return (
                                  <div
                                    key={notification.notification_id}
                                    className={cn(
                                      "rounded-lg p-2.5 text-xs space-y-1.5 relative group",
                                      !notification.readStatus ? "bg-primary/5" : "bg-muted/30"
                                    )}
                                    onClick={() => !notification.readStatus && markAsRead(notification.notification_id)}
                                  >
                                    <div className="flex gap-2">
                                      <div className={cn("flex-shrink-0 rounded-full p-1.5 h-7 w-7 flex items-center justify-center", colorClass)}>
                                        <Icon className="h-3.5 w-3.5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={cn(
                                          "text-xs leading-snug",
                                          !notification.readStatus ? "font-medium" : "text-muted-foreground"
                                        )}>
                                          {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                          {formatTimeAgo(notification.createdAt)}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => deleteNotification(notification.notification_id, e)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                            </div>
                          </ScrollArea>
                        </div>

                        <DropdownMenuSeparator className="my-2" />

                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                          >
                            <Button
                              variant={isActive(link.href) ? "secondary" : "ghost"}
                              className="w-full justify-start gap-3"
                            >
                              <link.icon className="h-4 w-4" />
                              {link.label}
                            </Button>
                          </Link>
                        ))}

                        {profilePath && (
                          <Link
                            href={profilePath}
                            onClick={() => setMobileOpen(false)}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3"
                            >
                              <CircleUser className="h-4 w-4" />
                              Edit Profile
                            </Button>
                          </Link>
                        )}
                      </div>
                    </nav>

                    <div className="border-t border-border px-3 py-4">
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
