/* Simple error boundary to prevent white screens and surface runtime errors */
import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error ?? new Error("Unknown error") };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // Optional: send to monitoring here
    // console.error("ErrorBoundary caught:", error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null });
    // Try soft reload of the app tree
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "Inter, system-ui, Arial" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Something went wrong.</h1>
          <p style={{ color: "#666", marginTop: 8 }}>
            The UI crashed while rendering this page. Use the details below to fix the issue.
          </p>

          <div style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: "#111827",
            color: "#e5e7eb",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
            whiteSpace: "pre-wrap"
          }}>
            {this.state.error?.message || String(this.state.error)}
            {this.state.info?.componentStack ? (
              <>
                {"\n\n"}Stack:{this.state.info.componentStack}
              </>
            ) : null}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#111827",
                color: "#e5e7eb",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#111827",
                color: "#e5e7eb",
                cursor: "pointer"
              }}
            >
              Hard Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
