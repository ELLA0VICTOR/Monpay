import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Menu, X, User, Settings, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ConnectWallet from './ConnectWallet';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { isConnected, address } = useAccount();
  const { isAuthenticated, user, login, logout, loading } = useAuth();

  const navItems = [
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/creator', label: 'Creator', requiresAuth: true },
    { path: '/me', label: 'My Subs', requiresAuth: true }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Mon</span>
              <span className="text-white">Pay</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              (!item.requiresAuth || (isConnected && isAuthenticated)) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path) 
                      ? 'text-accent bg-accent/10' 
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                {/* Auth Status */}
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-accent/30 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <User className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">
                        {user?.displayName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                      </span>
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-full mt-2 w-48 card p-2 z-50"
                      >
                        <Link
                          to="/creator"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors text-sm"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Creator Dashboard
                        </Link>
                        <Link
                          to="/me"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors text-sm"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          My Subscriptions
                        </Link>
                        <hr className="border-border my-1" />
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={login}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-accent hover:bg-accent-dark transition-colors disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {loading ? 'Signing...' : 'Sign In'}
                    </span>
                  </button>
                )}
                
                <ConnectWallet />
              </div>
            ) : (
              <ConnectWallet />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-card transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border"
          >
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                (!item.requiresAuth || (isConnected && isAuthenticated)) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'text-accent bg-accent/10'
                        : 'text-text-muted hover:text-white hover:bg-card'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              
              <div className="px-4 py-3 border-t border-border mt-4 pt-4 space-y-3">
                {isConnected ? (
                  <>
                    {/* Mobile Auth Status */}
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-card border border-border">
                      <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <User className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">
                        {isAuthenticated ? (user?.displayName || `${address?.slice(0, 6)}...${address?.slice(-4)}`) : 'Not Signed In'}
                      </span>
                    </div>

                    {/* Mobile Auth Button */}
                    {!isAuthenticated ? (
                      <button
                        onClick={() => { login(); setIsOpen(false); }}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent hover:bg-accent-dark transition-colors disabled:opacity-60 w-full justify-center"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {loading ? 'Signing...' : 'Sign In'}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => { logout(); setIsOpen(false); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors w-full justify-center"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    )}

                    <ConnectWallet />
                  </>
                ) : (
                  <ConnectWallet />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}