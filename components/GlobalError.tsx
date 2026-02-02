import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalError extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error!, () => this.setState({ hasError: false, error: null }));
            }

            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">error</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            {this.state.error?.message || "Unknown error occurred"}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors"
                            >
                                Reload App
                            </button>
                            <button
                                onClick={() => {
                                    window.history.replaceState(null, '', '/');
                                    window.location.reload();
                                }}
                                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Reset & Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
