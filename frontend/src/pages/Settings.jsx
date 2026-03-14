import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save } from 'lucide-react';
import { api } from '../services/api';

const Settings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/profile');
      const data = res.data || res;
      setProfile({ name: data.name || '', email: data.email || '' });
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: profile.name };
      if (password) payload.password = password;
      await api.put('/auth/profile', payload);
      setMsg('Profile updated!');
      setPassword('');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account profile.</p>
      </div>

      {isLoading ? <p className="text-slate-500">Loading...</p> : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={profile.email} disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password (optional)</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
            {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>{msg}</p>}
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              <Save size={18} /> Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
