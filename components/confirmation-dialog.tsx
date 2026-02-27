'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Trash2, LogOut, AlertTriangle } from 'lucide-react'


export type ConfirmationDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
    isDangerous?: boolean
    icon?: 'alert' | 'warning' | 'success' | 'trash' | 'logout'
    isLoading?: boolean
}

const iconMap = {
    alert: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle2,
    trash: Trash2,
    logout: LogOut,
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isDangerous = false,
    icon = 'alert',
    isLoading = false,
}: ConfirmationDialogProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const IconComponent = iconMap[icon]

    const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log('ConfirmationDialog: Confirm clicked')
        e.preventDefault()
        e.stopPropagation()
        
        if (isConfirming || isLoading) {
            console.log('Already confirming or loading, ignoring click')
            return
        }
        
        setIsConfirming(true)
        try {
            console.log('ConfirmationDialog: Calling onConfirm')
            await onConfirm()
            console.log('ConfirmationDialog: onConfirm completed')
            // Don't automatically close - let the parent component control this
            // onOpenChange(false)
        } catch (error) {
            console.error('Confirmation error:', error)
        } finally {
            setIsConfirming(false)
        }
    }

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log('ConfirmationDialog: Cancel clicked')
        e.preventDefault()
        e.stopPropagation()
        
        if (isConfirming || isLoading) {
            console.log('Confirming or loading, ignoring cancel')
            return
        }
        
        onCancel?.()
        onOpenChange(false)
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log('ConfirmationDialog: Backdrop clicked')
        e.preventDefault()
        e.stopPropagation()
        if (!isConfirming && !isLoading) {
            onCancel?.()
            onOpenChange(false)
        }
    }

    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                className="relative z-[100] w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                    <div
                        className={`inline-flex items-center justify-center rounded-full p-3 ${isDangerous
                            ? 'bg-red-100'
                            : icon === 'success'
                                ? 'bg-green-100'
                                : 'bg-primary/10'
                            }`}
                    >
                        <IconComponent
                            className={`h-6 w-6 ${isDangerous
                                ? 'text-red-600'
                                : icon === 'success'
                                    ? 'text-green-600'
                                    : 'text-primary'
                                }`}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
                    {description && (
                        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isConfirming || isLoading}
                        className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed sm:px-6"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isConfirming || isLoading}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:px-6 ${isDangerous
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-primary hover:bg-primary/90'
                            }`}
                    >
                        {isConfirming || isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                {confirmLabel}
                            </span>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export function useConfirmationDialog() {
    const [state, setState] = React.useState<{
        open: boolean
        config?: ConfirmationDialogProps
    }>({
        open: false,
    })

    const confirm = (config: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>) =>
        new Promise<void>((resolve) => {
            setState({
                open: true,
                config: {
                    ...config,
                    open: true,
                    onOpenChange: (open) => {
                        if (!open) {
                            setState({ open: false })
                            resolve()
                        }
                    },
                    onConfirm: async () => {
                        await config.onConfirm?.()
                        setState({ open: false })
                        resolve()
                    },
                } as ConfirmationDialogProps,
            })
        })

    return {
        confirm,
        ConfirmationDialog: state.config ? (
            <ConfirmationDialog
                {...state.config}
                open={state.open}
                onOpenChange={(open) => {
                    setState({ ...state, open })
                }}
            />
        ) : null,
    }
}
