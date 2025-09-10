
// This file re-exports the toast functionality from the hooks directory
// Direct re-export to avoid invoking hooks outside of React components

import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { toast as useToastOriginalToast, useToast, type ToastProps, type ToastActionElement } from "@/hooks/use-toast"

// Re-export the components and toast function but NOT the hook
export const toast = useToastOriginalToast;

// Re-export the hook
export { useToast };

// Re-export the types
export type { ToastProps, ToastActionElement }

// Re-export the components
export {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
