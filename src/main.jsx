import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div id="runtime-error-display" style={{ padding: 40, background: '#fee2e2', color: '#991b1b', fontFamily: 'monospace', minHeight: '100vh', zIndex: 999999 }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>Error rendering App:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10, background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #f87171' }}>
            {this.state.error?.toString()}
          </pre>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Stack:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10, background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #f87171' }}>
            {this.state.error?.stack}
          </pre>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Component Stack:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10, background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #f87171' }}>
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
