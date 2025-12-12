/**
 * Error Boundary component
 * Catches React errors and displays fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';
import { debugLog } from '../../utils/debugLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // #region agent log
    debugLog({
      location: 'ErrorBoundary.tsx:36',
      message: 'ErrorBoundary caught error',
      data: {
        errorMessage: error.message,
        errorName: error.name,
        componentStack: errorInfo.componentStack?.substring(0, 200),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'F',
    });
    // #endregion

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error monitoring (if configured)
    if (window.Telegram?.WebApp) {
      // Could send to Sentry/Catcher here
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.content}>
            <h1 className={styles.title}>Что-то пошло не так</h1>
            <p className={styles.message}>
              Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте обновить страницу.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.details}>
                <summary>Детали ошибки (только в development)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button onClick={this.handleReset} className={styles.button}>
              Попробовать снова
            </button>
            <button onClick={() => window.location.reload()} className={styles.button}>
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
