import { toast } from '@ski-blazek/ui/components/toast'

export const notifyError = (message: string, description: string) =>
	toast.add({ title: message, description, type: 'error' })

export const notifySuccess = (message: string, description: string) =>
	toast.add({ title: message, description, type: 'success' })
