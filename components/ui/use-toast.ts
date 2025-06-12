"use client"

import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000 // Keep toasts for a very long time

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
} & (
  | { variant?: "default" | "destructive" }
  | { variant?: "success" | "warning" | "info" }
)

type ToastState = {
  toasts: Toast[]
}

type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Partial<Toast> }
  | { type: "DISMISS_TOAST"; toastId?: Toast["id"] }
  | { type: "REMOVE_TOAST"; toastId?: Toast["id"] }

const reducer = (state: ToastState, action: Action): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST":
      const { toastId } = action

      // ! Side effects ! - beware of this.
      // Looking for a way to use the reducer to store the timeouts.
      if (toastId) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        dismissToast(toastId)
      } else {
        state.toasts.forEach((toast) => {
          dismissToast(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false } : t
        ),
      }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: ((state: ToastState) => void)[] = []

let memoryState: ToastState = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type ToastOptions = Partial<Toast>

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: React.useCallback((toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), []),
  }
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

function toast({ ...props }: ToastOptions) {
  const id = genId()

  const update = (props: Partial<Toast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({ type: "ADD_TOAST", toast: { id, ...props } })

  return { id, update, dismiss }
}

function dismissToast(toastId?: string) {
  dispatch({ type: "REMOVE_TOAST", toastId: toastId });
}

export { useToast, toast } 