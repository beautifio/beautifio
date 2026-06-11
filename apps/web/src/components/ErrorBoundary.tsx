"use client";

import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">
              Terjadi Kesalahan
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">
              {this.state.error?.message || "Terjadi kesalahan yang tidak terduga."}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex h-11 px-6 rounded-xl bg-primary text-white text-sm font-bold items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
