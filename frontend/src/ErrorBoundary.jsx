import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message ?? "Unexpected UI error",
    };
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6 text-slate-900">
          <section className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-xl shadow-slate-200/70">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-rose-500">
              Error boundary
            </p>
            <h1 className="text-3xl font-semibold">Something went wrong in the dashboard</h1>
            <p className="mt-4 text-sm leading-6 text-slate-500">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Try rendering again
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
