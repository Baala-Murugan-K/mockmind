import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const res = await API.post(endpoint, payload);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome${isLogin ? ' back' : ''}, ${user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-logo">🎙️</div>
        <div className="login-brand">MockMind</div>
        <p className="login-subtitle">AI-powered mock interviews, available 24/7</p>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <div className="login-divider"><span>or</span></div>
        <p className="login-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
