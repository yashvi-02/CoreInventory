import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, HelpCircle, ChevronDown, Search, BookOpen, Truck, CreditCard, Package, Building2, ShieldAlert, UserCog, Bell, Palette, SlidersHorizontal, Sun, Moon, Globe, Mail, Smartphone } from 'lucide-react';
import { api } from '../services/api';
import PageInfo from '../components/PageInfo';

/* ─────── Help FAQ Data ─────── */
const helpCategories = [
  {
    category: 'Dashboard & Navigation',
    icon: <BookOpen size={18} />,
    color: 'text-blue-600 bg-blue-50',
    items: [
      { q: 'The Dashboard is not loading or showing blank data', a: 'Try refreshing the page (Ctrl + R). If data is still missing, make sure you are logged in with the correct credentials. If the issue persists, clear your browser cache and try again.' },
      { q: 'Sidebar links are not working or pages are not loading', a: 'Ensure you are connected to the internet. If a specific page shows a blank screen, it may be under maintenance. Try navigating back to the Dashboard and clicking the link again.' },
      { q: 'Charts or graphs are not displaying correctly', a: 'Charts require JavaScript to be enabled in your browser. If you are using an older browser, consider updating to the latest version of Chrome, Firefox, or Edge.' },
    ]
  },
  {
    category: 'Products & Inventory',
    icon: <Package size={18} />,
    color: 'text-emerald-600 bg-emerald-50',
    items: [
      { q: 'How do I add a new product?', a: 'Navigate to the Products page from the sidebar. Fill in the product details in the form (Product Name, SKU, Category, Price, Quantity) and click "Add Product" to save it.' },
      { q: 'Product data is not saving after I click submit', a: 'Ensure all required fields (marked with *) are filled in. Check that the SKU is unique and the price/quantity values are valid numbers. If the problem persists, try logging out and back in.' },
      { q: 'Stock levels seem incorrect or out of sync', a: 'Stock levels update in real-time when transactions are recorded. Check the Stock Ledger page for a full history of all stock changes. If discrepancies persist, go to Inventory Adjustments to manually correct the values.' },
    ]
  },
  {
    category: 'Delivery Orders',
    icon: <Truck size={18} />,
    color: 'text-violet-600 bg-violet-50',
    items: [
      { q: 'What do the delivery statuses mean?', a: '"Pending" means the order is placed but not yet dispatched. "In Transit" means it is on the way. "Late" means the delivery is delayed and you will see the updated expected date. "Cancelled" means the order was cancelled and the reason will be displayed.' },
      { q: 'How do I place a new delivery order?', a: 'Go to the Delivery Orders page. Fill in the customer details form on the left side (Name, Address, City, State, Pin Code, Mobile, Email) and click "Place Order". The new order will appear in the table on the right.' },
      { q: 'My delivery is marked as "Late" — what should I do?', a: 'The system will automatically show the updated expected delivery date. You can also file a complaint under Reports & Complaints > "Late Delivery" category.' },
      { q: 'Address field is not accepting my full address', a: 'The address field has a 300-character limit. Try abbreviating long road names. The character counter in the top-right of the field shows remaining space.' },
    ]
  },
  {
    category: 'Transfers & Payments',
    icon: <CreditCard size={18} />,
    color: 'text-amber-600 bg-amber-50',
    items: [
      { q: 'What do the transaction statuses mean?', a: '"Pending" — payment initiated but not yet processed. "In Process" — bank is processing. "Completed" — funds successfully transferred.' },
      { q: 'My payment is stuck on "In Process"', a: 'NEFT/RTGS can take up to 24 hours on business days. If unchanged after 48 hours, file a complaint under Reports > "Payment Issue".' },
      { q: 'I was charged but the transaction shows "Pending"', a: 'This can happen due to network delays. Wait 2-4 hours. If it remains pending, contact your bank or file a complaint in the Reports section.' },
    ]
  },
  {
    category: 'Warehouses',
    icon: <Building2 size={18} />,
    color: 'text-rose-600 bg-rose-50',
    items: [
      { q: 'How do I know which warehouse my products are stored in?', a: 'Visit the Warehouses page. Each card shows stored product counts. Check the Stock Ledger for specific product locations.' },
      { q: 'Warehouse showing high capacity', a: 'If above 80% capacity, consider transferring stock to a lower-usage warehouse via the Transfers page.' },
    ]
  },
  {
    category: 'Account & Security',
    icon: <ShieldAlert size={18} />,
    color: 'text-slate-600 bg-slate-100',
    items: [
      { q: 'How do I change my password?', a: 'Go to Settings > Profile tab. Use the "Change Password" section to update your password.' },
      { q: 'I am getting logged out unexpectedly', a: 'Your session may have expired due to inactivity. Save your work frequently. Ensure cookies are enabled in your browser.' },
      { q: 'Can multiple users access the same account?', a: 'We recommend each user has their own account for security. Sharing credentials can lead to data conflicts.' },
    ]
  },
];

/* ─────── Settings Component ─────── */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
  });

  // Load profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const d = res?.data ?? res;
        if (d) {
          setProfile(prev => ({
            ...prev,
            fullName: d.name || prev.fullName,
            email: d.email || prev.email,
            role: d.role === 'manager' || d.role === 'admin' ? 'Manager' : 'Warehouse Staff',
          }));
        }
      } catch {
        // Keep defaults
      }
    };
    loadProfile();
  }, []);

  // General settings state
  const [general, setGeneral] = useState({
    companyName: 'CoreInventory Pvt. Ltd.',
    timezone: 'Asia/Kolkata (IST)',
    currency: 'INR (₹)',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    lowStockAlert: true,
    orderUpdates: true,
    paymentAlerts: true,
    weeklyReport: false,
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: 'light',
    sidebarCompact: false,
    animationsEnabled: true,
  });

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = helpCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const tabs = [
    { id: 'general',       label: 'General',       icon: <SlidersHorizontal size={16} /> },
    { id: 'profile',       label: 'Profile',       icon: <UserCog size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'appearance',    label: 'Appearance',    icon: <Palette size={16} /> },
    { id: 'help',          label: 'Help & FAQ',    icon: <HelpCircle size={16} /> },
  ];

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <SettingsIcon className="text-blue-600" /> Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account, preferences, and get help.</p>
      </div>

      <PageInfo
        title="What is the Settings page?"
        description="Configure your account, company preferences, notifications, and appearance. Find answers in the Help & FAQ section."
        activities={[
          'Update General settings (company name, timezone, currency, language)',
          'Edit your Profile (name, email, change password)',
          'Configure notification preferences',
          'Switch theme (light/dark) and adjust appearance',
          'Browse Help & FAQ for common questions'
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── General Tab ─── */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-slate-800 pb-4 border-b border-slate-100">General Settings</h2>
          {[
            { label: 'Company Name', value: general.companyName, key: 'companyName', type: 'text' },
            { label: 'Timezone', value: general.timezone, key: 'timezone', type: 'select', options: ['Asia/Kolkata (IST)', 'America/New_York (EST)', 'Europe/London (GMT)', 'Asia/Tokyo (JST)'] },
            { label: 'Currency', value: general.currency, key: 'currency', type: 'select', options: ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)'] },
            { label: 'Language', value: general.language, key: 'language', type: 'select', options: ['English', 'Hindi', 'Tamil', 'Telugu'] },
            { label: 'Date Format', value: general.dateFormat, key: 'dateFormat', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
          ].map(field => (
            <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Globe size={14} className="text-slate-400" /> {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={field.value}
                  onChange={(e) => setGeneral(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors w-full sm:w-64 cursor-pointer"
                >
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type="text" value={field.value}
                  onChange={(e) => setGeneral(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors w-full sm:w-64"
                />
              )}
            </div>
          ))}
          <button className="mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
            Save Changes
          </button>
        </div>
      )}

      {/* ─── Profile Tab ─── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-slate-800 pb-4 border-b border-slate-100">Profile Information</h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
              {profile.fullName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800">{profile.fullName}</p>
              <p className="text-sm text-slate-500">{profile.role}</p>
            </div>
          </div>

          {[
            { label: 'Full Name', value: profile.fullName, key: 'fullName', icon: <UserCog size={14} className="text-slate-400" /> },
            { label: 'Email Address', value: profile.email, key: 'email', icon: <Mail size={14} className="text-slate-400" /> },
            { label: 'Phone Number', value: profile.phone, key: 'phone', icon: <Smartphone size={14} className="text-slate-400" /> },
          ].map(field => (
            <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">{field.icon} {field.label}</label>
              <input
                type="text" value={field.value}
                onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors w-full sm:w-64"
              />
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Change Password</h3>
            <div className="space-y-3 max-w-sm">
              <input type="password" placeholder="Current Password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <input type="password" placeholder="New Password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>

          <button className="mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
            Update Profile
          </button>
        </div>
      )}

      {/* ─── Notifications Tab ─── */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-slate-800 pb-4 border-b border-slate-100">Notification Preferences</h2>
          {[
            { label: 'Email Alerts', desc: 'Receive important alerts via email', key: 'emailAlerts' },
            { label: 'SMS Alerts', desc: 'Get text message notifications on your phone', key: 'smsAlerts' },
            { label: 'Low Stock Alerts', desc: 'Notify when any product falls below minimum stock', key: 'lowStockAlert' },
            { label: 'Order Updates', desc: 'Get notified about delivery status changes', key: 'orderUpdates' },
            { label: 'Payment Alerts', desc: 'Alerts for completed or failed transactions', key: 'paymentAlerts' },
            { label: 'Weekly Summary Report', desc: 'Receive a weekly email summary of operations', key: 'weeklyReport' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <ToggleSwitch
                enabled={notifications[item.key]}
                onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              />
            </div>
          ))}
          <button className="mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
            Save Preferences
          </button>
        </div>
      )}

      {/* ─── Appearance Tab ─── */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-slate-800 pb-4 border-b border-slate-100">Appearance</h2>

          {/* Theme Selector */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Theme</p>
            <div className="flex gap-4">
              {[
                { id: 'light', label: 'Light', icon: <Sun size={20} />, desc: 'Clean white interface' },
                { id: 'dark',  label: 'Dark',  icon: <Moon size={20} />, desc: 'Easy on the eyes' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setAppearance(prev => ({ ...prev, theme: t.id }))}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${appearance.theme === t.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`mb-2 ${appearance.theme === t.id ? 'text-blue-600' : 'text-slate-400'}`}>{t.icon}</div>
                  <p className="text-sm font-medium text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-800">Compact Sidebar</p>
              <p className="text-xs text-slate-500 mt-0.5">Collapse sidebar to icon-only mode by default</p>
            </div>
            <ToggleSwitch
              enabled={appearance.sidebarCompact}
              onChange={() => setAppearance(prev => ({ ...prev, sidebarCompact: !prev.sidebarCompact }))}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-800">Page Animations</p>
              <p className="text-xs text-slate-500 mt-0.5">Enable smooth page transition animations</p>
            </div>
            <ToggleSwitch
              enabled={appearance.animationsEnabled}
              onChange={() => setAppearance(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }))}
            />
          </div>

          <button className="mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
            Apply Changes
          </button>
        </div>
      )}

      {/* ─── Help & FAQ Tab ─── */}
      {activeTab === 'help' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-lg group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help topics..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* FAQ Accordion */}
          {filteredCategories.map((cat, catIdx) => (
            <div key={catIdx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                <span className={`p-2 rounded-lg ${cat.color}`}>{cat.icon}</span>
                <h2 className="text-base font-bold text-slate-800">{cat.category}</h2>
                <span className="ml-auto text-xs text-slate-400 font-medium">{cat.items.length} topics</span>
              </div>
              <div className="divide-y divide-slate-100">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = openItems[key];
                  return (
                    <div key={itemIdx}>
                      <button
                        onClick={() => toggleItem(catIdx, itemIdx)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-blue-50/30 transition-colors group"
                      >
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors pr-4">{item.q}</span>
                        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <HelpCircle size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No results found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try different keywords or browse all categories.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
