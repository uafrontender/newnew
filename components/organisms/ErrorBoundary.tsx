import React from 'react';
import * as Sentry from '@sentry/react';

interface IReactFunction {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<IReactFunction> {
  componentDidCatch(error: Error, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    const { children } = this.props;
    return (
      <Sentry.ErrorBoundary fallback={<h1>Something went wrong.</h1>}>
        {children}
      </Sentry.ErrorBoundary>
    );
  }
}

export default ErrorBoundary;
