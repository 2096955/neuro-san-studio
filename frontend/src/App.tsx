import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import { PageProvider } from './contexts/PageContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { SelectedSystemProvider } from './contexts/SelectedSystemContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AppRouter from './components/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Neuro-SAN Studio',
  '/integrated-dashboard': 'Neuro-SAN Studio – Integrated Dashboard',
  '/rai': 'Neuro-SAN Studio – RAI',
  '/multi-agent-accelerator': 'Neuro-SAN Studio – Multi-Agent Accelerator',
  '/dashboard': 'Neuro-SAN Studio – Dashboard',
  '/guardrails': 'Neuro-SAN Studio – Guardrails',
  '/redteaming': 'Neuro-SAN Studio – Red Teaming',
  '/controls': 'Neuro-SAN Studio – Controls',
};

function AppContent() {
  const { isOpen, setIsOpen, toggle } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    const base = location.pathname.split('/').slice(0, 2).join('/') || '/';
    const title = ROUTE_TITLES[location.pathname] ?? ROUTE_TITLES[base] ?? 'Neuro-SAN Studio';
    document.title = title;
  }, [location.pathname]);

  const isRAIPage = location.pathname.startsWith('/rai');
  const isMultiAgentPage = location.pathname === '/multi-agent-accelerator';
  
  // Calculate header left position based on sidebars
  const getHeaderLeftPosition = () => {
    if (isRAIPage) {
      // RAI page has both main sidebar and secondary sidebar
      // Main sidebar: 224px (open) or 64px (collapsed)
      // Secondary sidebar: 256px width
      return isOpen ? '480px' : '320px'; // 224+256 or 64+256
    } else {
      // Other pages only have main sidebar
      return isOpen ? '224px' : '64px';
    }
  };

  // For multi-agent-accelerator page, render standalone (no sidebar/header)
  if (isMultiAgentPage) {
    return <AppRouter />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Sidebar */}
      <Sidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onToggle={toggle}
      />
        
      {/* Main Content with fixed header */}
      <main className={`transition-all duration-300 ${
        isOpen ? 'ml-56' : 'ml-16'
      }`}>
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 z-40 transition-all duration-300" style={{
          left: getHeaderLeftPosition()
        }}>
          <Header />
        </div>
      
        {/* Router Content with top padding for fixed header */}
        <div className="pt-16">
          <AppRouter />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SidebarProvider>
          <PageProvider>
            <BreadcrumbProvider>
              <SelectedSystemProvider>
                <AppContent />
              </SelectedSystemProvider>
            </BreadcrumbProvider>
          </PageProvider>
        </SidebarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
