import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-red-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              ഒരു പ്രശ്നം സംഭവിച്ചു (Something went wrong)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
              ആപ്പ് വീണ്ടും ലോഡ് ചെയ്യുക. നിങ്ങളുടെ സേവ് ചെയ്ത ഡാറ്റ സുരക്ഷിതമാണ്.
              <br />
              (Please reload the app. Your saved data is completely safe.)
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ആപ്പ് വീണ്ടും ലോഡ് ചെയ്യുക (Reload App)</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
