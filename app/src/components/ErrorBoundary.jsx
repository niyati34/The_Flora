import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    this.logErrorToService(error, errorInfo, errorId);
  }

  logErrorToService = (error, errorInfo, errorId) => {
    try {
      // Simulate sending error to external service
      const errorData = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        // Add any additional context you want to track
        context: {
          page: window.location.pathname,
          referrer: document.referrer,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timeOnPage: this.getTimeOnPage()
        }
      };

      // Store in localStorage for now (in real app, send to API)
      const errors = JSON.parse(localStorage.getItem('flora_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('flora_errors', JSON.stringify(errors.slice(-50))); // Keep last 50 errors

      // Simulate API call
      console.log('Error logged to service:', errorId);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  getTimeOnPage = () => {
    if (this.pageLoadTime) {
      return Date.now() - this.pageLoadTime;
    }
    return 0;
  };

  componentDidMount() {
    this.pageLoadTime = Date.now();
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleToggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // Create error report
    const report = `
Error Report - ID: ${errorId}

Error: ${error?.message}
Stack: ${error?.stack}

Component Stack:
${errorInfo?.componentStack}

URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
[User description here]
    `;

    // Copy to clipboard
    navigator.clipboard.writeText(report).then(() => {
      alert('Error report copied to clipboard. Please send this to support.');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = report;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Error report copied to clipboard. Please send this to support.');
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, showDetails, retryCount } = this.state;

      return (
        <div className="error-boundary">
          <style>
            {`
              .error-boundary {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              
              .error-container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                max-width: 600px;
                width: 100%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                text-align: center;
                border: 1px solid #e9ecef;
              }
              
              .error-icon {
                font-size: 4rem;
                color: #dc3545;
                margin-bottom: 20px;
                animation: pulse 2s infinite;
              }
              
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
              
              .error-title {
                font-size: 2rem;
                font-weight: 700;
                color: #333;
                margin-bottom: 15px;
              }
              
              .error-message {
                font-size: 1.1rem;
                color: #666;
                margin-bottom: 30px;
                line-height: 1.6;
              }
              
              .error-id {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 10px;
                font-family: monospace;
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 20px;
                word-break: break-all;
              }
              
              .error-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 30px;
              }
              
              .error-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9rem;
                text-decoration: none;
              }
              
              .error-btn.primary {
                background: #6A9304;
                color: white;
              }
              
              .error-btn.primary:hover {
                background: #5a7d03;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(106, 147, 4, 0.3);
              }
              
              .error-btn.secondary {
                background: #6c757d;
                color: white;
              }
              
              .error-btn.secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
              }
              
              .error-btn.outline {
                background: transparent;
                color: #6A9304;
                border: 2px solid #6A9304;
              }
              
              .error-btn.outline:hover {
                background: #6A9304;
                color: white;
                transform: translateY(-2px);
              }
              
              .error-btn.danger {
                background: #dc3545;
                color: white;
              }
              
              .error-btn.danger:hover {
                background: #c82333;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
              }
              
              .error-details {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
                text-align: left;
                max-height: 300px;
                overflow-y: auto;
              }
              
              .error-details h4 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.1rem;
              }
              
              .error-stack {
                background: #2d3748;
                color: #e2e8f0;
                padding: 15px;
                border-radius: 8px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.8rem;
                line-height: 1.4;
                overflow-x: auto;
                white-space: pre-wrap;
                word-break: break-all;
              }
              
              .error-help {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
                color: #856404;
              }
              
              .error-help h4 {
                color: #856404;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .error-help ul {
                margin: 0;
                padding-left: 20px;
                text-align: left;
              }
              
              .error-help li {
                margin-bottom: 8px;
                line-height: 1.5;
              }
              
              .retry-count {
                background: #e9ecef;
                border-radius: 20px;
                padding: 8px 16px;
                font-size: 0.8rem;
                color: #666;
                margin-bottom: 20px;
                display: inline-block;
              }
              
              @media (max-width: 768px) {
                .error-container {
                  padding: 30px 20px;
                  margin: 20px;
                }
                
                .error-title {
                  font-size: 1.5rem;
                }
                
                .error-actions {
                  flex-direction: column;
                  align-items: center;
                }
                
                .error-btn {
                  width: 100%;
                  max-width: 300px;
                  justify-content: center;
                }
              }
            `}
          </style>

          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <h1 className="error-title">Oops! Something went wrong</h1>
            
            <p className="error-message">
              We're sorry, but something unexpected happened. Don't worry, your data is safe 
              and this error has been logged for our team to investigate.
            </p>

            {errorId && (
              <div className="error-id">
                <strong>Error ID:</strong> {errorId}
              </div>
            )}

            {retryCount > 0 && (
              <div className="retry-count">
                <i className="fas fa-redo me-2"></i>
                Retry attempt: {retryCount}
              </div>
            )}

            <div className="error-actions">
              <button 
                className="error-btn primary"
                onClick={this.handleRetry}
              >
                <i className="fas fa-redo"></i>
                Try Again
              </button>
              
              <button 
                className="error-btn secondary"
                onClick={this.handleReload}
              >
                <i className="fas fa-sync-alt"></i>
                Reload Page
              </button>
              
              <button 
                className="error-btn outline"
                onClick={this.handleGoHome}
              >
                <i className="fas fa-home"></i>
                Go Home
              </button>
              
              <button 
                className="error-btn danger"
                onClick={this.handleReportError}
              >
                <i className="fas fa-bug"></i>
                Report Error
              </button>
            </div>

            <button 
              className="error-btn outline"
              onClick={this.handleToggleDetails}
              style={{ marginTop: '20px' }}
            >
              <i className={`fas fa-${showDetails ? 'eye-slash' : 'eye'}`}></i>
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </button>

            {showDetails && (
              <div className="error-details">
                <h4>
                  <i className="fas fa-code me-2"></i>
                  Technical Details
                </h4>
                
                {error && (
                  <div style={{ marginBottom: '20px' }}>
                    <strong>Error Message:</strong>
                    <div style={{ 
                      background: '#f8d7da', 
                      color: '#721c24', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      marginTop: '5px',
                      fontFamily: 'monospace'
                    }}>
                      {error.message}
                    </div>
                  </div>
                )}

                {errorInfo && errorInfo.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <div className="error-stack">
                      {errorInfo.componentStack}
                    </div>
                  </div>
                )}

                {error && error.stack && (
                  <div style={{ marginTop: '20px' }}>
                    <strong>Error Stack:</strong>
                    <div className="error-stack">
                      {error.stack}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="error-help">
              <h4>
                <i className="fas fa-lightbulb"></i>
                What you can try:
              </h4>
              <ul>
                <li>Refresh the page and try again</li>
                <li>Clear your browser cache and cookies</li>
                <li>Check your internet connection</li>
                <li>Try using a different browser</li>
                <li>If the problem persists, contact our support team</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
