'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-mono">
          <div className="text-red-500 text-lg font-bold mb-2">SYSTEM FAULT</div>
          <div className="text-xs text-center max-w-xs">{this.state.error?.message}</div>
          <button
            className="mt-4 px-4 py-2 border border-slate-700 rounded text-xs hover:bg-slate-800 transition"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            RETRY
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
