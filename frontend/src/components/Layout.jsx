import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Package, 
  LayoutDashboard, 
  ReceiptText, 
  Truck, 
  ArrowLeftRight, 
  Settings2, 
  Building2, 
  BookOpenText, 
  LineChart, 
  Settings,
  Menu,
  Bell,
  Search,
  User,
  LogOut
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Receipts', path: '/receipts', icon: <ReceiptText size={20} /> },
    { name: 'Delivery Orders', path: '/delivery', icon: <Truck size={20} /> },
    { name: 'Transfers', path: '/transfers', icon: <ArrowLeftRight size={20} /> },
    { name: 'Inventory Adjustments', path: '/adjustments', icon: <Settings2 size={20} /> },
    { name: 'Warehouses', path: '/warehouses', icon: <Building2 size={20} /> },
    { name: 'Stock Ledger', path: '/ledger', icon: <BookOpenText size={20} /> },
    { name: 'Reports', path: '/reports', icon: <LineChart size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col z-20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <div className="flex items-center gap-3 font-semibold text-lg overflow-hidden whitespace-nowrap">
            <Package className="text-blue-500 shrink-0" size={28} />
            <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              CoreInventory
            </span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 fancy-scrollbar">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  title={!sidebarOpen ? item.name : ''}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className={`transition-opacity duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu size={24} />
            </button>
            
            <div className="relative relative-search group max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search products, orders..." 
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notification */}
            <div className="relative">
              <button 
                onClick={() => setNotifyOpen(!notifyOpen)}
                onBlur={() => setTimeout(() => setNotifyOpen(false), 200)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative focus:outline-none"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
              
              {notifyOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right z-50">
                  <div className="p-4 border-b border-slate-100 font-semibold flex justify-between items-center bg-slate-50/50">
                    Notifications
                    <span className="text-xs font-normal text-blue-600 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-slate-800">System running smoothly</p>
                      <p className="text-xs text-slate-500 mt-1">Just now</p>
                    </div>
                    <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-slate-800">Inventory ready for updates</p>
                      <p className="text-xs text-slate-500 mt-1">5m ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative border-l border-slate-200 pl-4 h-8 flex items-center">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                onBlur={() => setTimeout(() => setProfileOpen(false), 200)}
                className="flex items-center gap-2 focus:outline-none group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold relative group-hover:ring-2 group-hover:ring-blue-500 group-hover:ring-offset-2 transition-all">
                  U
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin</span>
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-sm font-medium text-slate-900">User Account</p>
                    <p className="text-xs text-slate-500 truncate">admin@coreinventory.com</p>
                  </div>
                  <div className="py-1">
                    <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <User size={16} /> Profile
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <Settings size={16} /> Settings
                    </a>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default Layout;
