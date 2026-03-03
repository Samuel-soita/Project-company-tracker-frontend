import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Shield, RefreshCw } from 'lucide-react';

const Verify2FA = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);

    // Countdown for resend button
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleResendCode = async () => {
        setResending(true);
        setError('');

        try {
            const userId = localStorage.getItem('pending_2fa_user_id');
            const userEmail = localStorage.getItem('pending_2fa_email');
            const userPassword = localStorage.getItem('pending_2fa_password');

            if (!userId || !userEmail || !userPassword) {
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            await authAPI.login({ email: userEmail, password: userPassword });

            setResendTimer(60);
            setCanResend(false);
            alert('A new verification code has been sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to resend code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userId = localStorage.getItem('pending_2fa_user_id');
            if (!userId) {
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const data = await authAPI.verify2FA(userId, code);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            localStorage.removeItem('pending_2fa_user_id');
            localStorage.removeItem('pending_2fa_email');
            localStorage.removeItem('pending_2fa_password');

            navigate(data.user.role === 'Admin' ? '/admin/dashboard' : '/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid 2FA code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-holo-cyan/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-holo-magenta/10 rounded-full blur-[120px] animate-pulse-slow" />

            <div className="glass-card p-12 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-holo-cyan/10 border border-holo-cyan/20 rounded-3xl mx-auto flex-center mb-6 shadow-neon-cyan/20">
                        <Shield className="text-holo-cyan" size={40} />
                    </div>
                    <h2 className="text-3xl font-black neon-text-cyan tracking-tighter uppercase italic mb-2">
                        Account <span className="text-white">Verification</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Two-Factor Authentication Required</p>
                </div>

                <p className="text-slate-400 text-center text-xs mb-10 leading-relaxed font-medium">
                    Please enter the 6-digit verification code sent to your registered email address.
                </p>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest text-center italic">Verification Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            required
                            autoFocus
                            className="w-full py-6 px-4 text-center text-4xl font-black bg-white/5 border border-white/10 rounded-2xl focus:neon-border-cyan focus:outline-none text-holo-cyan transition-all tracking-[0.5em] placeholder-slate-800"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full btn-holo btn-holo-cyan py-5 text-sm"
                    >
                        {loading ? 'Verifying Code...' : 'Confirm and Log In'}
                    </button>
                </form>

                <div className="text-center mt-10 space-y-6">
                    <button
                        onClick={handleResendCode}
                        disabled={!canResend || resending}
                        className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-holo-cyan hover:neon-text-cyan transition-all disabled:text-slate-600 disabled:cursor-not-allowed group"
                    >
                        <RefreshCw size={14} className={`group-hover:rotate-180 transition-transform duration-500 ${resending ? 'animate-spin' : ''}`} />
                        {resending
                            ? 'Sending Code...'
                            : canResend
                                ? 'Resend Verification Code'
                                : `Resend available in: ${resendTimer}s`}
                    </button>

                    <div className="pt-8 border-t border-white/5">
                        <button
                            onClick={() => {
                                localStorage.removeItem('pending_2fa_user_id');
                                localStorage.removeItem('pending_2fa_email');
                                localStorage.removeItem('pending_2fa_password');
                                navigate('/login');
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <span>Back to Login</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verify2FA;
