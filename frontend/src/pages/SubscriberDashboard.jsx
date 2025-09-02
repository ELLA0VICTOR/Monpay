import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Calendar, Users, RefreshCw,
  X, Check, AlertCircle, ExternalLink,
  Clock, DollarSign, Zap, FileText
} from 'lucide-react';
import { subscription, payment } from '../utils/api';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import useContract from '../hooks/useContract.js';
import useMetaTransaction from '../hooks/useMetaTransaction.js';

export default function SubscriberDashboard() {
  const { address, isConnected } = useAccount();
  const { contract } = useContract();
  const meta = useMetaTransaction(contract);
  const { isAuthenticated } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (isConnected && isAuthenticated && address) {
      loadSubscriptions();
      loadPaymentHistory();
    } else {
      setSubscriptions([]);
      setPaymentHistory([]);
      setLoading(false);
    }
  }, [address, isConnected, isAuthenticated]);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const { data } = await subscription.getMine();
      
      // Normalize subscription data
      const normalized = (Array.isArray(data) ? data : []).map((s) => ({
        ...s,
        status: computeStatus(s.expiresAt, s.autoRenew),
        price: s.price || s.amount || s.priceWei || '0',
        startedAt: s.createdAt || s.startedAt || null,
        planId: s.planId || s.id,
        creator: s.creator || s.creatorAddress,
        creatorName: s.creatorName || s.creator?.displayName || shorten(s.creator)
      }));

      setSubscriptions(normalized);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast.error('Failed to load subscriptions');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadPaymentHistory() {
    try {
      const { data } = await payment.getHistory();
      
      // Normalize payment data
      const normalized = (Array.isArray(data) ? data : []).map((p) => ({
        ...p,
        amount: p.amount || p.value || '0',
        status: p.status || 'completed',
        creatorName: p.creatorName || p.creator?.displayName || shorten(p.creator),
        planName: p.planName || `Plan #${p.planId}`
      }));

      setPaymentHistory(normalized);
    } catch (error) {
      console.error('Failed to load payment history:', error);
      // Don't show error for payment history (non-critical)
      setPaymentHistory([]);
    }
  }

  async function cancelSubscription(planId) {
    try {
      setCancelling(planId);
      const toastId = toast.loading('Cancelling subscription...');

      // Encode meta transaction for cancel(planId)
      const data = meta.encode(contract.abi, 'cancel', [planId]);
      await meta.sendMeta(address, contract.address, data);

      // Update backend
      try {
        const subToCancel = subscriptions.find(s => s.planId === planId);
        if (subToCancel) {
          await subscription.cancel(subToCancel._id || subToCancel.id);
        }
      } catch (backendError) {
        console.error('Backend cancellation failed:', backendError);
        // Continue anyway, blockchain tx succeeded
      }

      toast.success('Subscription cancelled successfully!', { id: toastId });
      await loadSubscriptions();
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel subscription: ' + (error.message || 'Unknown error'));
    } finally {
      setCancelling(null);
    }
  }

  function computeStatus(expiresAt, autoRenew) {
    if (!expiresAt) return 'unknown';
    const exp = new Date(expiresAt).getTime();
    const now = Date.now();
    if (exp > now) return 'active';
    if (!autoRenew) return 'expired';
    return 'expired'; // expired but autoRenew could attempt to charge
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'expired': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-yellow-400';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'active': return <Check className="w-4 h-4" />;
      case 'expired': return <X className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  }

  function formatAmount(amount) {
    try {
      if (amount === undefined || amount === null) return '0.00';
      const n = typeof amount === 'string' && amount.length > 12
        ? Number(amount) / 1e18
        : Number(amount);
      if (Number.isNaN(n)) return '0.00';
      return n.toFixed(2);
    } catch {
      return '0.00';
    }
  }

  function getNextRenewal() {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    if (activeSubscriptions.length === 0) return 'None';

    const nextRenewal = activeSubscriptions.reduce((earliest, sub) => {
      const subDate = new Date(sub.expiresAt);
      return !earliest || subDate < earliest ? subDate : earliest;
    }, null);

    if (!nextRenewal) return 'None';

    const days = Math.ceil((nextRenewal - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Today';
  }

  function shorten(addr = '') {
    if (!addr) return '';
    try {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    } catch {
      return addr;
    }
  }

  if (!isConnected || !isAuthenticated) {
    return (
      <div className="card text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-gray-400 mb-6">
          Connect your wallet and sign in to view your subscriptions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            My <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]">Subscriptions</span>
          </h1>
          <p className="text-gray-400">
            Manage your active subscriptions and payment history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadSubscriptions(); loadPaymentHistory(); }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/6 text-sm hover:bg-white/2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            label: 'Active Subscriptions',
            value: subscriptions.filter(s => s.status === 'active').length,
            icon: <Check className="w-5 h-5" />,
            color: 'text-green-400'
          },
          {
            label: 'Total Spent',
            value: `${paymentHistory.reduce((sum, p) => {
              const amt = p.amount || p.value || 0;
              const n = typeof amt === 'string' && amt.length > 12 ? Number(amt) / 1e18 : Number(amt);
              return sum + (Number.isFinite(n) ? n : 0);
            }, 0).toFixed(2)} WMON`,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-pink-400'
          },
          {
            label: 'Next Renewal',
            value: getNextRenewal(),
            icon: <Calendar className="w-5 h-5" />,
            color: 'text-blue-400'
          },
          {
            label: 'Gas Saved',
            value: '100%',
            icon: <Zap className="w-5 h-5" />,
            color: 'text-green-400'
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="glass p-4 rounded-xl"
          >
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-lg font-bold mb-1">{stat.value}</div>
            <div className="text-gray-400 text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Active Subscriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#8b5cf6]" />
          Active Subscriptions ({subscriptions.filter(s => s.status === 'active').length})
        </h2>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="loading-pulse h-24 rounded-xl bg-gradient-to-r from-white/2 to-white/3 animate-pulse" />
            ))}
          </div>
        ) : subscriptions.filter(s => s.status === 'active').length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-4">No active subscriptions</p>
            <a href="/marketplace" className="inline-flex items-center gap-2 btn">
              Browse Marketplace
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.filter(s => s.status === 'active').map((sub, i) => (
              <motion.div
                key={sub._id || sub.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass p-6 rounded-xl hover:shadow-neon transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {sub.planName || `Plan #${sub.planId}`}
                      </h3>
                      <div className={`flex items-center gap-1 text-sm ${getStatusColor(sub.status)}`}>
                        {getStatusIcon(sub.status)}
                        <span className="capitalize">{sub.status}</span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-3">
                      Creator: {sub.creatorName}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs">Next Billing</span>
                        <div className="font-medium">
                          {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Amount</span>
                        <div className="font-medium">
                          {formatAmount(sub.price)} WMON
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Auto-Renew</span>
                        <div className={`font-medium ${sub.autoRenew ? 'text-green-400' : 'text-yellow-400'}`}>
                          {sub.autoRenew ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Started</span>
                        <div className="font-medium">
                          {sub.startedAt ? new Date(sub.startedAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => window.open(`/content/${sub.creator}`, '_blank')}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/6 text-sm hover:bg-white/2 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Content
                    </button>

                    <button
                      onClick={() => cancelSubscription(sub.planId)}
                      disabled={cancelling === sub.planId}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 transition disabled:opacity-60"
                    >
                      {cancelling === sub.planId ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Cancel
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#8b5cf6]" />
          Payment History ({paymentHistory.length})
        </h2>

        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">No payment history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Creator</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Plan</th>
                  <th className="text-right py-3 text-gray-400 font-medium">Amount</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, i) => (
                  <motion.tr
                    key={payment._id || payment.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/8 hover:bg-white/2 transition-colors"
                  >
                    <td className="py-4">
                      <div className="text-sm">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '—'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-medium">
                        {payment.creatorName}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm">{payment.planName}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="text-sm font-medium">
                        {formatAmount(payment.amount)} WMON
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                        ${payment.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                        payment.status === 'failed' ? 'bg-red-400/10 text-red-400' :
                        'bg-yellow-400/10 text-yellow-400'}`}>
                        {payment.status === 'completed' ? <Check className="w-4 h-4" /> :
                         payment.status === 'failed' ? <X className="w-4 h-4" /> :
                         <AlertCircle className="w-4 h-4" />}
                        <span className="capitalize">{payment.status || 'unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      {payment.txHash ? (
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${payment.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}