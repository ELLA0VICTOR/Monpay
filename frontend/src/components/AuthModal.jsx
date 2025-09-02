import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Shield, Zap, Lock, CheckCircle } from 'lucide-react';

export default function AuthModal() {
  const { login, loading } = useAuth();

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure Authentication",
      description: "Sign with your wallet - no passwords needed"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Gasless Transactions",
      description: "All transactions are gasless - we pay the fees"
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Decentralized",
      description: "Your data stays secure on the blockchain"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            M
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Sign in to <span className="gradient-text">MonPay</span>
          </h2>
          <p className="text-text-muted">
            Authenticate with your wallet to access creator features
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
            >
              <div className="text-accent mt-0.5">{feature.icon}</div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                <p className="text-text-muted text-xs">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sign In Button */}
        <button
          onClick={login}
          disabled={loading}
          className="btn w-full mb-4"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing Message...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Sign Message to Continue
            </>
          )}
        </button>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs text-text-dimmed">
            By signing, you agree to our terms and confirm you own this wallet
          </p>
        </div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-300">
              <strong>Secure:</strong> We never store your private keys. 
              Authentication happens entirely through wallet signatures.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}