import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Code2, History, LogOut, Code, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-bg-secondary border-r border-border-default transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-default">
          {isSidebarOpen && (
            <div className="brand-lockup flex items-center gap-2 text-accent-glow font-bold text-xl animate-fade-in">
              <Code className="h-6 w-6" />
              <span>DevAudit <em>AI</em></span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-bg-elevated rounded-md text-text-secondary hover:text-text-primary transition-colors mx-auto">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="app-nav flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-accent-primary/20 text-accent-glow' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium animate-fade-in">Dashboard</span>}
          </NavLink>
          <NavLink to="/audit" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-accent-primary/20 text-accent-glow' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <Code2 className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium animate-fade-in">Code Audit</span>}
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-accent-primary/20 text-accent-glow' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <History className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium animate-fade-in">History</span>}
          </NavLink>
        </nav>
        
        <div className="sidebar-footer p-4 border-t border-border-default">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium animate-fade-in">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="topbar h-16 bg-bg-secondary/50 backdrop-blur-md border-b border-border-default flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="text-sm text-text-muted font-mono">Workspace / {user?.username}</div>
          <div className="flex items-center gap-3">
            <div className="status-pill flex items-center gap-2 bg-bg-elevated px-3 py-1.5 rounded-full border border-border-default shadow-sm">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-sm font-medium text-text-primary">System Online</span>
            </div>
            <div className="avatar-chip h-8 w-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold shadow-md">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-bg-primary relative">
          <Outlet />
        </div>
        
        <footer className="h-8 bg-bg-secondary border-t border-border-default flex items-center px-4 text-xs text-text-muted justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span>DevAudit AI v1.0.0</span>
            <span>React 18</span>
            <span>Vite</span>
          </div>
          <div>Powered by LLM</div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
