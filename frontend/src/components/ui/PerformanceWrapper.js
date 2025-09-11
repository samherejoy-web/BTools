import React, { Suspense } from 'react';

// Performance optimized component wrapper with error boundary
class PerformanceWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-gray-500">
          <p>Something went wrong loading this component.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  </div>
);

// Performance wrapper with suspense and error boundary
const withPerformanceOptimization = (Component, loadingMessage) => {
  return React.memo((props) => (
    <PerformanceWrapper>
      <Suspense fallback={<LoadingFallback message={loadingMessage} />}>
        <Component {...props} />
      </Suspense>
    </PerformanceWrapper>
  ));
};

// Pre-built optimized wrappers
export const OptimizedCommentsSection = withPerformanceOptimization(
  React.lazy(() => import('./comments')), 
  "Loading comments..."
);

export const OptimizedCodeEditor = withPerformanceOptimization(
  React.lazy(() => import('./code-editor')), 
  "Loading editor..."
);

export { LoadingFallback, PerformanceWrapper, withPerformanceOptimization };