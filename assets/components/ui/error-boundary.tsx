import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component to gracefully handle React rendering errors.
 * Prevents the entire app from crashing when a component fails.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null })
  }

  private handleRefreshPage = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Une erreur est survenue',
        fallbackMessage = 'Le composant a rencontré un problème. Vous pouvez essayer de recharger.',
      } = this.props

      return (
        <Card className="p-6 m-4 border-destructive/20">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold text-foreground">{fallbackTitle}</h2>
            <p className="text-muted-foreground text-center max-w-md">{fallbackMessage}</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 p-4 bg-muted rounded-lg text-xs text-destructive overflow-auto max-w-full max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button onClick={this.handleRefreshPage}>
                Recharger la page
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
