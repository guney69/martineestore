import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 h-screen overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong (White Screen Fixed)</h1>
                    <h2 className="text-xl font-semibold">{this.state.error?.toString()}</h2>
                    <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto text-black">
                        {this.state.errorInfo?.componentStack}
                    </pre>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }}
                        className="mt-8 px-6 py-3 bg-red-600 text-white rounded shadow hover:bg-red-700"
                    >
                        ⚠️ Reset App Data & Restart
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
