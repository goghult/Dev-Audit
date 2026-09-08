import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code, LogIn, ArrowRight } from 'lucide-react';
import api from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.accessToken, response.data.user);
      window.location.assign('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      <div className="auth-backdrop" aria-hidden="true"><span /><span /><span /></div>

      <div className="auth-card w-full max-w-md p-8 glass-panel z-10 animate-slide-up mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="auth-mark h-16 w-16 flex items-center justify-center mb-4">
            <Code className="h-8 w-8 text-accent-glow" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p className="text-text-secondary text-center text-sm">Sign in to continue to DevAudit AI</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-3 rounded-lg mb-6 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input bg-bg-primary border border-border-default rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <a href="#" className="text-xs text-accent-primary hover:text-accent-glow transition-colors">Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input bg-bg-primary border border-border-default rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-submit mt-4 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-accent-primary/25"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-default text-center">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-primary hover:text-accent-glow font-medium inline-flex items-center gap-1 transition-colors">
              Create one <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
