import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent2/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        <footer className="border-t border-border mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <span className="text-xl font-bold">
                    <span className="gradient-text">Mon</span>
                    <span className="text-white">Pay</span>
                  </span>
                </div>
                <p className="text-text-muted mb-4 max-w-md">
                  Revolutionizing creator monetization with gasless payments and 
                  smart recurring subscriptions on Monad Testnet.
                </p>
                <div className="flex items-center gap-4 text-sm text-text-dimmed">
                  <span>Built on Monad Testnet</span>
                  <span>•</span>
                  <span>100% Gasless</span>
                  <span>•</span>
                  <span>Decentralized</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-text-muted">
                  <li><a href="/marketplace" className="hover:text-accent transition-colors">Marketplace</a></li>
                  <li><a href="/creator" className="hover:text-accent transition-colors">Creator Dashboard</a></li>
                  <li><a href="/me" className="hover:text-accent transition-colors">My Subscriptions</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-text-muted">
                  <li><a href="https://testnet.monadexplorer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Block Explorer</a></li>
                  <li><a href="https://docs.monad.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Monad Docs</a></li>
                  <li><span className="text-text-dimmed">Contact Support</span></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-text-dimmed text-sm">
                © 2025 MonPay. Built for Monad Testnet.
              </p>
              <div className="flex items-center gap-4 text-sm text-text-dimmed">
                <span>Chain ID: 10143</span>
                <span>•</span>
                <span>Wmon: {import.meta.env.VITE_WMON?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#141422',
            color: '#white',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px',
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#141422'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#141422'
            }
          },
          loading: {
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#141422'
            }
          }
        }}
      />
    </div>
  );
}