import { toast } from 'sonner'

// guide for styling sonner toasts:
// https://sonner.emilkowal.ski/styling

export const notifyError = (message: string, description: string) =>
  toast.error(message, { description, position: 'top-right' })

export const notifySuccess = (message: string, description: string) =>
  toast.success(message, { description, position: 'top-right' })
