import React from 'react';
import * as Sentry from '@sentry/react';

import ErrorPage from './ErrorPage';

interface IErrorBoundary {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<IErrorBoundary> {
  componentDidCatch(error: Error, errorInfo: any) {
    console.error(error, errorInfo);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { children } = this.props;
    return (
      <Sentry.ErrorBoundary fallback={<ErrorPage />}>
        {children}
      </Sentry.ErrorBoundary>
    );
  }
}

export default ErrorBoundary;
