import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { authApi } from '@/lib/api';
export function MagicLinkForm({ onSent }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);
        try {
            await authApi.sendMagicLink(email);
            setStatus('sent');
            onSent?.();
        }
        catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to send magic link');
        }
    };
    if (status === 'sent') {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "max-w-sm w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center", children: [_jsx("div", { className: "mb-4", children: _jsx("svg", { className: "mx-auto h-12 w-12 text-green-500", width: "48", height: "48", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Check your email" }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["We sent a magic link to ", _jsx("span", { className: "font-medium text-gray-700", children: email }), ". Click the link to sign in."] }), _jsx("button", { onClick: () => setStatus('idle'), className: "mt-4 text-sm text-blue-600 hover:text-blue-700", children: "Use a different email" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "max-w-sm w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-1", children: "MarketFlow" }), _jsx("p", { className: "text-gray-500 text-sm", children: "Sign in with a magic link" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email address" }), _jsx("input", { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", disabled: status === 'loading' })] }), error && (_jsx("p", { className: "text-sm text-red-600", children: error })), _jsx("button", { type: "submit", disabled: status === 'loading', className: "w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: status === 'loading' ? 'Sending...' : 'Send magic link' })] }), _jsx("p", { className: "mt-4 text-center text-xs text-gray-400", children: "No password needed. We'll email you a sign-in link." })] }) }));
}
