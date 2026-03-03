import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData);

            if (result.requires2FA) {
                navigate('/verify-2fa');
            } else if (result.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            // Handle different types of errors
            if (err.code === 'NETWORK_ERROR') {
                setError('Unable to connect to the server. Please check your connection and ensure the backend server is running.');
            } else if (err.message.includes('Too many requests')) {
                setError('Too many login attempts. Please wait a moment before trying again.');
            } else if (err.message.includes('Authentication failed') || err.message.includes('Invalid email or password')) {
                setError('Invalid email or password. Please check your credentials.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
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
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black neon-text-cyan tracking-tighter uppercase italic mb-2">
                        Smirror <span className="text-white">Limited</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Project Tracker Access</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-holo-cyan transition-colors" size={18} />
                            <input
                                type="email"
                                name="email"
                                placeholder="name@matrix.net"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:neon-border-cyan focus:outline-none text-white transition-all placeholder-slate-600 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-holo-cyan transition-colors" size={18} />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:neon-border-cyan focus:outline-none text-white transition-all placeholder-slate-600 font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-holo btn-holo-cyan py-5 text-sm"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 text-center space-y-4">
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        New Employee?{' '}
                        <Link to="/signup" className="text-holo-cyan hover:neon-text-cyan transition-all ml-2">
                            Create Account
                        </Link>
                    </p>
                    <p className="text-slate-600 text-[10px] font-medium italic">
                        Forgot Password? <Link to="/reset-password" name="reset-password-link" className="hover:text-slate-400 transition-colors">Reset Password</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
