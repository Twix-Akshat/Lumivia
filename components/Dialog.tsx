'use client'

import { useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

export default function Dialog() {
  const [basicOpen, setBasicOpen] = useState(false)
  const [dangerousOpen, setDangerousOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-background p-6 sm:p-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Confirmation Dialog
          </h1>
          <p className="text-muted-foreground">
            Reusable confirmation dialog component with multiple variants
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 font-semibold text-foreground">Basic Dialog</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Standard confirmation for general actions
            </p>
            <button
              onClick={() => setBasicOpen(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Open Basic Dialog
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 font-semibold text-foreground">Dangerous Action</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Destructive action with warning styling
            </p>
            <button
              onClick={() => setDangerousOpen(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Open Dangerous Dialog
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 font-semibold text-foreground">Success Action</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Positive action with success styling
            </p>
            <button
              onClick={() => setSuccessOpen(true)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Open Success Dialog
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 font-semibold text-foreground">Logout Action</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              With loading state simulation
            </p>
            <button
              onClick={() => setLogoutOpen(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Open Logout Dialog
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold text-foreground">Usage Example</h2>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground">
            {`<ConfirmationDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete Account?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={() => deleteAccount()}
  isDangerous={true}
  icon="trash"
/>`}
          </pre>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmationDialog
        open={basicOpen}
        onOpenChange={setBasicOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action?"
        confirmLabel="Proceed"
        cancelLabel="Cancel"
        onConfirm={async () => {
          console.log('Basic action confirmed')
        }}
        icon="alert"
      />

      <ConfirmationDialog
        open={dangerousOpen}
        onOpenChange={setDangerousOpen}
        title="Delete Forever?"
        description="This item will be permanently deleted and cannot be recovered."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        isDangerous={true}
        icon="trash"
        isLoading={isLoading}
      />

      <ConfirmationDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Save Changes?"
        description="Your changes will be saved and published immediately."
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        icon="success"
        isLoading={isLoading}
      />

      <ConfirmationDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Sign Out?"
        description="You will be logged out of your account."
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        onConfirm={handleConfirm}
        icon="logout"
        isLoading={isLoading}
      />
    </div>
  )
}
