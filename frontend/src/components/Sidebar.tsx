import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function Sidebar({ isOpen = true, onClose, onToggle }: SidebarProps) {
  const { updateBreadcrumbs } = useBreadcrumb();
  const location = useLocation();



  const handleRAIClick = () => {
    updateBreadcrumbs([
      { label: 'Trust', path: '/rai' },
      { label: 'Overview' }
    ]);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Collapsed Sidebar - Vertical Icon Ribbon */}
      {!isOpen && (
        <div className="fixed left-0 top-0 h-full bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground transition-all duration-300 ease-in-out z-50 shadow-lg backdrop-blur-md border-r border-border/30 w-16 flex flex-col">
          {/* Header with Toggle */}
          <div className="p-3 border-b border-border/50">
            {onToggle && (
              <button
                onClick={onToggle}
                className="w-10 h-10 rounded-lg hover:bg-muted/70 transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm group flex items-center justify-center"
                title="Expand Sidebar"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Icon Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-2">
            

            <Link
                to="/rai"
                onClick={handleRAIClick}
                className={`w-12 h-12 rounded-xl transition-all duration-300 group hover:shadow-lg backdrop-blur-sm border flex items-center justify-center ${
                  isActive('/rai') 
                    ? 'bg-neurosan-blue-500/20 border-neurosan-blue-500/30 shadow-lg' 
                    : 'hover:bg-muted/50 border-transparent hover:border-border/20'
                }`}
                title="Trust"
              >
                <svg className={`w-5 h-5 group-hover:scale-110 transition-transform duration-200 ${
                  isActive('/rai') ? 'text-neurosan-blue-600' : 'text-neurosan-slate-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </Link>

              <Link
                to="/controls"
                onClick={() => updateBreadcrumbs([{ label: 'Controls', path: '/controls' }])}
                className={`w-12 h-12 rounded-xl transition-all duration-300 group hover:shadow-lg backdrop-blur-sm border flex items-center justify-center ${
                  isActive('/controls') 
                    ? 'bg-neurosan-blue-500/20 border-neurosan-blue-500/30 shadow-lg' 
                    : 'hover:bg-muted/50 border-transparent hover:border-border/20'
                }`}
                title="Controls"
              >
                <svg className={`w-5 h-5 group-hover:scale-110 transition-transform duration-200 ${
                  isActive('/controls') ? 'text-neurosan-blue-600' : 'text-neurosan-slate-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </Link>

         
            </div>
          </nav>

          {/* Support and Docs Icons */}
          <div className="p-2 space-y-2">
            <button
              className="w-12 h-12 rounded-xl transition-all duration-300 group hover:shadow-lg backdrop-blur-sm border flex items-center justify-center hover:bg-muted/50 border-transparent hover:border-border/20"
              title="Support"
            >
              <svg className="w-5 h-5 text-neurosan-blue-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>

            <button
              className="w-12 h-12 rounded-xl transition-all duration-300 group hover:shadow-lg backdrop-blur-sm border flex items-center justify-center hover:bg-muted/50 border-transparent hover:border-border/20"
              title="Docs"
            >
              <svg className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 hover:scale-105 transition-all duration-200 cursor-pointer group">
              <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Expanded Sidebar - Modern Design */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground transition-all duration-300 ease-in-out z-50 shadow-2xl backdrop-blur-md border-r border-border/30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-56`}>
        {/* Modern Header */}
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-transparent via-border/5 to-transparent">
          <div className="flex items-center justify-center w-full">
            <svg className="w-12 h-12 flex-shrink-0" fill="none" viewBox="0 0 32 32">
              <path d="M16 2L6 6v8c0 6.627 4.373 12.627 10 14 5.627-1.373 10-7.373 10-14V6l-10-4z" fill="url(#greenShieldGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"></path>
              <path d="M16 4L8 7v7c0 5.523 3.477 10.523 8 12 4.523-1.477 8-6.477 8-12V7l-8-3z" fill="rgba(255,255,255,0.15)"></path>
              <path d="M16 8c-3.314 0-6 2.686-6 6s2.686 6 6 6c1.657 0 3.157-.671 4.243-1.757l-1.415-1.415C18.157 17.499 17.157 18 16 18c-2.209 0-4-1.791-4-4s1.791-4 4-4c1.157 0 2.157.501 2.828 1.172l1.415-1.415C19.157 8.671 17.657 8 16 8z" fill="white"></path>
              <defs>
                <linearGradient id="greenShieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981"></stop>
                  <stop offset="50%" stopColor="#059669"></stop>
                  <stop offset="100%" stopColor="#047857"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute top-4 right-4">{/* Move toggle to absolute position */}
            <div className="flex items-center space-x-1">
              {/* Modern Toggle Button in Header */}
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-muted/70 transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm group"
                  title="Collapse Sidebar"
                >
                  <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {/* Modern Close Button (Mobile) */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-lg hover:bg-muted/70 transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modern Navigation Menu */}
        <nav className="p-4 pt-3">
          <ul className="space-y-2">
            <li>
              <Link
                to="/integrated-dashboard"
                onClick={() => updateBreadcrumbs([{ label: 'Integrated Dashboard', path: '/integrated-dashboard' }])}
                className={`flex items-center p-4 rounded-xl transition-all duration-300 group hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border border-transparent hover:border-border/20 cursor-pointer ${
                  isActive('/integrated-dashboard')
                    ? 'bg-neurosan-blue-500/20 border-neurosan-blue-500/30'
                    : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30'
                }`}
              >
                <div className={`p-2 rounded-lg mr-4 transition-colors duration-200 ${
                  isActive('/integrated-dashboard') ? 'bg-neurosan-blue-500/30' : 'bg-neurosan-blue-500/10 group-hover:bg-neurosan-blue-500/20'
                }`}>
                  <svg className="w-4 h-4 text-neurosan-blue-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium text-neurosan-blue-600 group-hover:text-neurosan-blue-600 transition-colors duration-200">Integrated Dashboard</span>
              </Link>
            </li>

          <li>
              <Link
                to="/rai"
                onClick={handleRAIClick}
                className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border border-transparent hover:border-border/20"
              >
                <div className="p-2 rounded-lg bg-gray-500/10 group-hover:bg-gray-500/20 transition-colors duration-200 mr-4">
                  <svg className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-medium group-hover:text-gray-500 transition-colors duration-200">Trust & Safety</span>
              </Link>
            </li>

            <li>
              <Link
                to="/controls"
                onClick={() => updateBreadcrumbs([{ label: 'Controls', path: '/controls' }])}
                className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border border-transparent hover:border-border/20"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-200 mr-4">
                  <svg className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <span className="font-medium group-hover:text-purple-500 transition-colors duration-200">Controls</span>
              </Link>
            </li>

      
          </ul>
        </nav>

      {/* Support and Docs Section */}
      <div className="absolute bottom-20 left-0 right-0 p-4 space-y-2">
        <button className="w-full flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border border-transparent hover:border-border/20">
          <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-200 mr-3">
            <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-blue-500 transition-colors duration-200">Support</span>
        </button>

        <button className="w-full flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border border-transparent hover:border-border/20">
          <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors duration-200 mr-3">
            <svg className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-indigo-500 transition-colors duration-200">Docs</span>
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mr-3 shadow-lg border-2 border-white/20 hover:scale-105 transition-all duration-200 cursor-pointer group">
            <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
