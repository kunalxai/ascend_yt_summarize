import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="text-sm font-semibold" style={{ color: '#2c3437' }}>
            Something went wrong rendering this panel.
          </p>
          <button
            onClick={() => this.setState({ crashed: false })}
            className="text-xs font-semibold px-4 py-2 rounded-full"
            style={{ backgroundColor: '#426656', color: '#fff' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;