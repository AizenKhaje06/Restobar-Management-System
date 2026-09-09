"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Edit3,
  Filter,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROLE_LABELS, relativeTime } from "@/lib/constants"
import type { Profile, UserRole } from "@/lib/types"
import { updateStaffAction, toggleStaffStatusAction, createStaffAccountAction, cancelStaffInviteAction } from "@/app/actions/admin"

type StaffWithTables = Profile & { assigned_tables: string[] }

const ROLE_STYLES: Record<UserRole, { className: string }> = {
  admin:  { className: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  pos:    { className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  waiter: { className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
}

function initials(name?: string | null) {
  if (!name) return "?"
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

export function StaffManager({
  staff,
  currentUserId,
}: {
  staff: StaffWithTables[]
  currentUserId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [editDialog, setEditDialog] = useState<{ open: boolean; staff: StaffWithTables | null }>({
    open: false,
    staff: null,
  })
  const [addDialog, setAddDialog] = useState<{ open: boolean }>({ open: false })

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (roleFilter !== "all" && s.role !== roleFilter) return false
      if (statusFilter === "active" && !s.is_active) return false
      if (statusFilter === "inactive" && s.is_active) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        (s.full_name ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q)
      )
    })
  }, [staff, search, roleFilter, statusFilter])

  const stats = useMemo(() => {
    return {
      total: staff.length,
      admins: staff.filter((s) => s.role === "admin").length,
      pos: staff.filter((s) => s.role === "pos").length,
      waiters: staff.filter((s) => s.role === "waiter").length,
      active: staff.filter((s) => s.is_active).length,
      inactive: staff.filter((s) => !s.is_active).length,
    }
  }, [staff])

  const onToggleStatus = (member: StaffWithTables) => {
    if (member.id === currentUserId) return
    startTransition(async () => {
      await toggleStaffStatusAction(member.id, !member.is_active)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description={`${stats.total} members • ${stats.active} active • ${stats.inactive} inactive`}
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Staff" }]}
        actions={
          <Button onClick={() => setAddDialog({ open: true })}>
            <UserPlus className="mr-2 size-4" />
            Add Staff
          </Button>
        }
      />

      {/* Role summary */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(["admin", "pos", "waiter"] as UserRole[]).map((role) => {
          const value = role === "admin" ? stats.admins : role === "pos" ? stats.pos : stats.waiters
          const s = ROLE_STYLES[role]
          const active = roleFilter === role
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(active ? "all" : role)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                active ? "border-primary bg-primary/5" : "hover:bg-muted/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>
                  {ROLE_LABELS[role]}
                </span>
              </span>
              <span className="text-lg font-semibold tabular-nums">{value}</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="h-9 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {(search || roleFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setRoleFilter("all")
                setStatusFilter("all")
              }}
            >
              <Filter className="mr-1 size-3" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Staff list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm font-medium">No staff found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {filtered.map((member) => {
                const isMe = member.id === currentUserId
                const s = ROLE_STYLES[member.role]
                return (
                  <li
                    key={member.id}
                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback className="bg-muted text-sm font-medium">
                        {initials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {member.full_name ?? member.email ?? "Unnamed"}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>
                          <ShieldCheck className="size-3" />
                          {ROLE_LABELS[member.role]}
                        </span>
                        {!member.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                        {isMe && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" />
                            {member.email}
                          </span>
                        )}
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {member.phone}
                          </span>
                        )}
                        <span>Joined {relativeTime(member.created_at)}</span>
                        {member.role === "waiter" && member.assigned_tables.length > 0 && (
                          <span>
                            Assigned: <span className="font-medium text-foreground">{member.assigned_tables.join(", ")}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          size="sm"
                          checked={member.is_active}
                          onCheckedChange={() => onToggleStatus(member)}
                          disabled={isMe || pending}
                        />
                        <span className="text-xs text-muted-foreground">
                          {member.is_active ? (
                            <UserCheck className="size-3.5 text-emerald-600" />
                          ) : (
                            <UserX className="size-3.5 text-rose-600" />
                          )}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button size="icon-sm" variant="ghost" />}
                        >
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditDialog({ open: true, staff: member })}>
                            <Edit3 className="size-3.5" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <StaffEditDialog
        key={editDialog.staff?.id ?? "new"}
        open={editDialog.open}
        staff={editDialog.staff}
        onClose={() => setEditDialog({ open: false, staff: null })}
        onSaved={() => {
          setEditDialog({ open: false, staff: null })
          router.refresh()
        }}
      />

      {/* Add Staff dialog */}
      <AddStaffDialog
        open={addDialog.open}
        onClose={() => setAddDialog({ open: false })}
        onSaved={() => {
          setAddDialog({ open: false })
          router.refresh()
        }}
      />
    </div>
  )
}

// ============================================================
// Edit dialog
// ============================================================
function StaffEditDialog({
  open,
  staff,
  onClose,
  onSaved,
}: {
  open: boolean
  staff: StaffWithTables | null
  onClose: () => void
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [role, setRole] = useState<UserRole>(staff?.role ?? "waiter")
  const [isActive, setIsActive] = useState(staff?.is_active ?? true)

  // Re-sync when dialog opens with a different staff
  useMemo(() => {
    if (staff) {
      setRole(staff.role)
      setIsActive(staff.is_active)
      setSuccess(false)
      setError(null)
    }
  }, [staff])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!staff) return
    setError(null)
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    fd.set("role", role)
    fd.set("is_active", String(isActive))
    startTransition(async () => {
      const result = await updateStaffAction(staff.id, fd)
      if (result?.error) {
        setError(result.error)
        setTimeout(() => setError(null), 5000)
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setTimeout(() => onSaved(), 1000) // Close after showing success
    })
  }

  return (
    <>
      {success && (
        <div className="fixed top-20 right-6 z-50 min-w-[320px] rounded-lg border border-emerald-500/50 bg-white p-4 shadow-xl dark:bg-gray-950 dark:border-emerald-500/30 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>
                Staff updated
              </p>
              <p className="mt-0.5 text-xs" style={{ color: '#333333' }}>
                Changes have been saved successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update role and access. The user will need to re-login to see role-based changes take full effect.
            </DialogDescription>
          </DialogHeader>
          {staff && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-muted text-sm font-medium">
                    {initials(staff.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{staff.full_name ?? "Unnamed"}</div>
                  <div className="text-xs text-muted-foreground">{staff.email}</div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" defaultValue={staff.full_name ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={staff.phone ?? ""} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" defaultValue={(staff as any).address ?? ""} placeholder="Street, City, Province" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role-select">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger id="role-select" className="w-full">
                      <SelectValue>
                        {ROLE_LABELS[role]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="pos">POS Cashier</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex h-10 items-center gap-3 rounded-md border bg-transparent px-3">
                    <Switch
                      id="is_active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <span className="text-sm">
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================================
// Add Staff dialog (NEW: Direct account creation)
// ============================================================
function AddStaffDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("waiter")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    const fd = new FormData(e.currentTarget)
    fd.set("role", selectedRole)
    fd.set("password", password)

    startTransition(async () => {
      const result = await createStaffAccountAction(fd)
      if (result?.error) {
        setError(result.error)
        setTimeout(() => setError(null), 5000)
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setTimeout(() => {
        // Reset form
        setPassword("")
        setConfirmPassword("")
        setSelectedRole("waiter")
        onSaved()
      }, 1000)
    })
  }

  const handleClose = () => {
    if (!pending) {
      setError(null)
      setSuccess(false)
      setPassword("")
      setConfirmPassword("")
      setSelectedRole("waiter")
      onClose()
    }
  }

  return (
    <>
      {success && (
        <div className="fixed top-20 right-6 z-[100] min-w-[320px] rounded-lg border border-emerald-500/50 bg-white p-4 shadow-xl dark:bg-gray-950 dark:border-emerald-500/30 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <UserPlus className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>
                Staff account created
              </p>
              <p className="mt-0.5 text-xs" style={{ color: '#333333' }}>
                New staff member can now login with their username.
              </p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Staff Account</DialogTitle>
            <DialogDescription>
              Create a new staff account directly. Staff will login with username and password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add_full_name">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add_full_name"
                  name="full_name"
                  placeholder="Juan dela Cruz"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add_username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add_username"
                  name="username"
                  placeholder="juandc"
                  required
                  autoComplete="off"
                  pattern="[a-z0-9_]+"
                  minLength={3}
                  maxLength={20}
                  className="lowercase"
                />
                <p className="text-xs text-muted-foreground">
                  3-20 characters, lowercase letters, numbers, underscores only
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="add_password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="add_password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add_confirm_password">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="add_confirm_password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add_role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as UserRole)}
                >
                  <SelectTrigger id="add_role" className="w-full">
                    <SelectValue>{ROLE_LABELS[selectedRole]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="pos">POS Cashier</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="add_phone">Phone number</Label>
                  <Input
                    id="add_phone"
                    name="phone"
                    type="tel"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add_address">Address</Label>
                  <Input
                    id="add_address"
                    name="address"
                    placeholder="City, Province"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <strong>Note:</strong> The account will be created immediately and the staff member can login right away using their username and password.
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                <Plus className="mr-2 size-4" />
                {pending ? "Creating account..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

