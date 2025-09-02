import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, FileText, Calendar, 
  ExternalLink, Twitter, Globe, Star,
  TrendingUp, Clock, DollarSign
} from 'lucide-react';
import { creator, content, subscription } from '../utils/api';
import PlanCard from '../components/PlanCard.jsx';
import ContentCard from '../components/ContentCard.jsx';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext.jsx';
import useContract from '../hooks/useContract.js';
import useMetaTransaction from '../hooks/useMetaTransaction.js';
import toast from 'react-hot-toast';

export default function CreatorProfile() {
  const { address: creatorAddress } = useParams();
  const { address: userAddress, isConnected } = useAccount();
  const { contract } = useContract();
  const meta = useMetaTransaction(contract);
  const { isAuthenticated, login } = useAuth();
  
  const [creatorData, setCreatorData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');

  useEffect(() => {
    if (creatorAddress) {
      loadCreatorData();
    }
  }, [creatorAddress]);

  async function loadCreatorData() {
    try {
      setLoading(true);
      
      // Load creator profile
      const { data: creatorResponse } = await creator.getDetails(creatorAddress);
      setCreatorData(creatorResponse);
      setPlans(creatorResponse?.plans || []);
      
      // Load creator's content
      const { data: contentResponse } = await content.getByCreator(creatorAddress);
      setContents(Array.isArray(contentResponse) ? contentResponse : []);
      
    } catch (error) {
      console.error('Failed to load creator:', error);
      toast.error('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  }

  async function subscribe(plan) {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isAuthenticated) {
      const success = await login();
      if (!success) return;
    }

    try {
      setSubscribing(plan.id || plan.planId);
      const toastId = toast.loading('Processing subscription...');
      
      const data = meta.encode(contract.abi, 'subscribe', [
        plan.id || plan.planId || 0, 
        1, // 1 period
        true // auto-renew
      ]);
      const res = await meta.sendMeta(userAddress, contract.address, data);
      
      // Create subscription record in backend
      try {
        await subscription.create({
          subscriber: userAddress,
          creator: creatorAddress,
          planId: plan.id || plan.planId,
          planName: plan.name,
          price: plan.price,
          period: plan.period,
          autoRenew: true,
          status: 'active',
          expiresAt: new Date(Date.now() + (plan.period * 1000)).toISOString(),
          txHash: res.txHash
        });
      } catch (backendError) {
        console.error('Backend subscription creation failed:', backendError);
      }
      
      toast.success('Subscription successful!', { id: toastId });
      
    } catch (error) {
      console.error('Subscription failed:', error);
      toast.error('Subscription failed: ' + (error.message || 'Unknown error'));
    } finally {
      setSubscribing(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="loading-pulse h-8 w-32"></div>
        <div className="loading-pulse h-48 rounded-2xl"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="loading-pulse h-64 rounded-xl"></div>
          <div className="loading-pulse h-64 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!creatorData) {
    return (
      <div className="card text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-text-dimmed" />
        <h2 className="text-2xl font-bold mb-2">Creator Not Found</h2>
        <p className="text-text-muted mb-6">
          The creator profile you're looking for doesn't exist.
        </p>
        <Link to="/marketplace" className="btn">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link 
          to="/marketplace"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </motion.div>

      {/* Creator Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {creatorData.displayName?.charAt(0) || 'C'}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">{creatorData.displayName || 'Unnamed Creator'}</h1>
            <p className="text-text-muted text-lg mb-4 leading-relaxed">
              {creatorData.bio || 'No bio available'}
            </p>
            
            {/* Social Links */}
            {(creatorData.socialLinks?.twitter || creatorData.socialLinks?.website) && (
              <div className="flex items-center gap-4 mb-4">
                {creatorData.socialLinks?.twitter && (
                  <a
                    href={`https://twitter.com/${creatorData.socialLinks.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>@{creatorData.socialLinks.twitter.replace('@', '')}</span>
                  </a>
                )}
                {creatorData.socialLinks?.website && (
                  <a
                    href={creatorData.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Users className="w-4 h-4" />, label: 'Subscribers', value: creatorData.analytics?.subscribers || 0 },
                { icon: <FileText className="w-4 h-4" />, label: 'Contents', value: contents.length },
                { icon: <Star className="w-4 h-4" />, label: 'Active Plans', value: plans.filter(p => p.active).length },
                { icon: <Calendar className="w-4 h-4" />, label: 'Member Since', value: new Date(creatorData.createdAt || Date.now()).getFullYear() }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-accent mb-1">
                    {stat.icon}
                    <span className="text-lg font-bold">{stat.value}</span>
                  </div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 p-1 bg-card rounded-2xl"
      >
        {[
          { id: 'plans', label: 'Subscription Plans', count: plans.filter(p => p.active).length },
          { id: 'content', label: 'Content Library', count: contents.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-glow'
                : 'text-text-muted hover:text-white hover:bg-card-hover'
            }`}
          >
            <span className="font-medium">{tab.label}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {plans.filter(p => p.active).length === 0 ? (
              <div className="card text-center py-16">
                <Star className="w-16 h-16 mx-auto mb-4 text-text-dimmed" />
                <h3 className="text-xl font-semibold mb-2">No Active Plans</h3>
                <p className="text-text-muted">This creator hasn't published any subscription plans yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {plans.filter(p => p.active).map((plan, i) => (
                  <motion.div
                    key={plan.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <PlanCard
                      plan={plan}
                      isSubscribing={subscribing === (plan.id || plan.planId)}
                      onSubscribe={() => subscribe(plan)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Content Preview</h2>
              <p className="text-sm text-text-muted">
                Subscribe to access full content library
              </p>
            </div>
            
            {contents.length === 0 ? (
              <div className="card text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-text-dimmed" />
                <h3 className="text-xl font-semibold mb-2">No Content Yet</h3>
                <p className="text-text-muted">This creator hasn't uploaded any content yet.</p>
              </div>
            ) : (
              <div className="content-grid">
                {contents.slice(0, 6).map((item, i) => (
                  <motion.div
                    key={item._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ContentCard 
                      item={item} 
                      isLocked={true}
                      onOpen={() => toast.error('Subscribe to access this content')}
                    />
                  </motion.div>
                ))}
                
                {contents.length > 6 && (
                  <div className="card flex items-center justify-center py-8 border-dashed border-accent/30">
                    <div className="text-center">
                      <p className="text-text-muted mb-2">+{contents.length - 6} more content</p>
                      <p className="text-sm text-accent">Subscribe to view all</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Subscribe CTA */}
      {plans.filter(p => p.active).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-accent/5 border-accent/30"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              Unlock Premium Content
            </h3>
            <p className="text-text-muted mb-6">
              Subscribe to access all of {creatorData.displayName}'s exclusive content
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {plans.filter(p => p.active).slice(0, 3).map((plan, i) => (
                <button
                  key={plan.id || i}
                  onClick={() => subscribe(plan)}
                  disabled={subscribing === (plan.id || plan.planId)}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card border border-accent/30 hover:border-accent transition-all duration-300 disabled:opacity-60"
                >
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-accent text-sm">{Number(plan.price) / 1e18} WMON</div>
                  </div>
                  {subscribing === (plan.id || plan.planId) ? (
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}