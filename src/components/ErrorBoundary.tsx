import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('მოულოდნელი UI შეცდომა:', error, errorInfo.componentStack);
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <main className="error-screen" role="alert" aria-live="assertive">
          <div className="error-panel">
            <span className="error-panel__icon"><AlertTriangle size={28} /></span>
            <p className="eyebrow">შეფერხება მოხდა</p>
            <h1>გვერდის ჩვენება ვერ მოხერხდა</h1>
            <p>მონაცემების ჩვენებისას მოულოდნელი შეცდომა წარმოიშვა. სცადეთ გვერდის ხელახლა ჩატვირთვა.</p>
            <button className="button button--primary" onClick={this.retry} type="button">
              <RotateCcw size={16} /> სცადეთ ხელახლა
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
