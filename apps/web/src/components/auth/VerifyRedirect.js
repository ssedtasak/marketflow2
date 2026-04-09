import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
export function VerifyRedirect() {
    const [status, setStatus] = useState('verifying');
    const [errorMsg, setErrorMsg] = useState(null);
    const { login } = useAuth();
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
            setStatus('error');
            setErrorMsg('No verification token found in URL.');
            return;
        }
        authApi
            .verifyToken(token)
            .then((data) => {
            login(data.token, data.user);
            // Clear token from URL and redirect to home
            window.location.href = window.location.pathname;
        })
            .catch((err) => {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Verification failed.');
        });
    }, [login]);
    if (status === 'error') {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "max-w-sm w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center", children: [_jsx("div", { className: "mb-4", children: _jsx("svg", { className: "mx-auto h-12 w-12 text-red-500", width: "48", height: "48", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Verification failed" }), _jsx("p", { className: "text-gray-500 text-sm mb-4", children: errorMsg }), _jsx("a", { href: "/", className: "text-sm text-blue-600 hover:text-blue-700", children: "Try again" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "max-w-sm w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center", children: [_jsx("div", { className: "mb-4", children: _jsxs("svg", { className: "mx-auto h-12 w-12 text-blue-500 animate-spin", width: "48", height: "48", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Verifying..." }), _jsx("p", { className: "text-gray-500 text-sm", children: "Completing sign-in, please wait." })] }) }));
}
