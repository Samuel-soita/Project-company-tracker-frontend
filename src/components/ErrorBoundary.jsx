import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error('Error caught by boundary:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // In production, you would send this to a service like Sentry
        // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    render() {
        if (this.state.hasError) {
            // Custom premium holographic error UI
            return (
                <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
                    {/* Background Orbs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-holo-cyan/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-holo-magenta/10 rounded-full blur-[120px]" />

                    <div className="glass-card p-12 w-full max-w-md relative z-10 text-center animate-in fade-in zoom-in duration-700">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl mx-auto flex-center mb-8 shadow-red-500/10">
                            <AlertCircle className="text-red-500" size={40} />
                        </div>

                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                            System <span className="text-red-500">Failure</span>
                        </h1>

                        <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
                            Critical matrix breach detected. The current operational parameters have been suspended due to an unhandled exception.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={this.handleRetry}
                                className="w-full btn-holo btn-holo-cyan py-5 text-sm flex-center gap-3"
                            >
                                <RefreshCw size={16} className={`${this.state.hasError ? 'animate-spin-slow' : ''}`} />
                                REINITIALIZE SESSION
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                ABORT TO TERMINUS
                            </button>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-10 text-left border-t border-white/5 pt-6">
                                <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
                                    Error Logs (System Only)
                                </summary>
                                <div className="mt-4 text-[10px] bg-black/40 border border-white/5 p-4 rounded-xl overflow-auto max-h-48 font-mono text-red-400/80 leading-relaxed scrollbar-hide">
                                    <p className="font-bold mb-2">ERR_MSG: {this.state.error.toString()}</p>
                                    <p className="opacity-60 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</p>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;