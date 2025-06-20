import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString();
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error details
    this.logError(error, errorInfo, errorId);
  }

  logError = (error, errorInfo, errorId) => {
    const errorData = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('flora_errors') || '[]');
      existingErrors.push(errorData);
      
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('flora_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error('Failed to store error:', storageError);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // Create error report
    const report = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };

    // Copy to clipboard for easy reporting
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please share with support.');
      })
      .catch(() => {
        // Fallback: show error details in alert
        alert(`Error ID: ${errorId}\nPlease report this error with the ID.`);
      });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary container mt-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Oops! Something went wrong
            </h4>
            <p>
              We're sorry, but something unexpected happened. Don't worry, 
              your data is safe and this error has been logged.
            </p>
            
            <div className="mt-3">
              <button 
                className="btn btn-primary me-2"
                onClick={this.handleRetry}
              >
                <i className="fas fa-redo me-1"></i>
                Try Again
              </button>
              
              <button 
                className="btn btn-outline-secondary me-2"
                onClick={() => window.location.href = '/'}
              >
                <i className="fas fa-home me-1"></i>
                Go Home
              </button>
              
              <button 
                className="btn btn-outline-info"
                onClick={this.handleReportError}
              >
                <i className="fas fa-bug me-1"></i>
                Report Error
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary className="btn btn-sm btn-outline-warning">
                  Show Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-light border rounded small">
                  <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  <strong>Stack:</strong> {this.state.error && this.state.error.stack}
                  {'\n\n'}
                  <strong>Component Stack:</strong> {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = (error, context = '') => {
    const errorData = {
      id: Date.now().toString(),
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      const existingErrors = JSON.parse(localStorage.getItem('flora_errors') || '[]');
      existingErrors.push(errorData);
      localStorage.setItem('flora_errors', JSON.stringify(existingErrors.slice(-10)));
    } catch (storageError) {
      console.error('Failed to store error:', storageError);
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Manual error report:', error, context);
    }
  };

  return { reportError };
}

export default ErrorBoundary;
