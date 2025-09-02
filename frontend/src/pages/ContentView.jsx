import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Lock, Play, FileText, Image, Headphones, 
  Calendar, User, ArrowLeft, ExternalLink,
  Shield, CheckCircle, Zap
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { creator, content } from '../utils/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import useContract from '../hooks/useContract.js';
import toast from 'react-hot-toast';

export default function ContentView() {
  const { address: creatorAddress } = useParams();
  const { address: userAddress, isConnected } = useAccount();
  const { publicClient, contract } = useContract();
  const { isAuthenticated } = useAuth();
  
  const [contents, setContents] = useState([]);
  const [creatorData, setCreatorData] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);

  useEffect(() => {
    if (creatorAddress) {
      loadCreatorContent();
      if (isConnected && userAddress && isAuthenticated) {
        checkSubscriptionAccess();
      }
    }
  }, [creatorAddress, userAddress, isConnected, isAuthenticated]);

  async function loadCreatorContent() {
    try {
      setLoading(true);
      
      // Load creator info
      const { data: creatorResponse } = await creator.getDetails(creatorAddress);
      setCreatorData(creatorResponse);
      
      // Load content
      const { data: contentResponse } = await content.getByCreator(creatorAddress);
      setContents(Array.isArray(contentResponse) ? contentResponse : []);
      
    } catch (error) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load creator content');
    } finally {
      setLoading(false);
    }
  }

  async function checkSubscriptionAccess() {
    if (!userAddress || !creatorAddress) return;
    
    try {
      setCheckingAccess(true);
      
      // Check if user has active subscription via smart contract
      const isSubscriber = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'isSubscriber',
        args: [creatorAddress, userAddress]
      });
      
      setHasAccess(isSubscriber);
      
    } catch (error) {
      console.error('Failed to check subscription access:', error);
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  }

  function getContentIcon(type) {
    switch (type) {
      case 'video': return <Play className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'audio': return <Headphones className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  }

  function getContentTypeColor(type) {
    switch (type) {
      case 'video': return 'bg-red-500/10 text-red-400';
      case 'image': return 'bg-green-500/10 text-green-400';
      case 'audio': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-purple-500/10 text-purple-400';
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="loading-pulse h-32 rounded-2xl"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="loading-pulse h-48 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!creatorData) {
    return (
      <div className="card text-center py-16">
        <User className="w-16 h-16 mx-auto mb-4 text-text-dimmed" />
        <h2 className="text-2xl font-bold mb-2">Creator Not Found</h2>
        <p className="text-text-muted mb-6">
          The creator you're looking for doesn't exist.
        </p>
        <Link to="/marketplace" className="btn">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
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
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-2xl">
            {creatorData?.displayName?.charAt(0) || 'C'}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{creatorData?.displayName || 'Creator'}</h1>
            <p className="text-text-muted mb-4">{creatorData?.bio || 'No bio available'}</p>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                <span>{creatorData?.analytics?.subscribers || 0} subscribers</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span>{contents.length} contents</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span>Joined {new Date(creatorData?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Access Status */}
          <div className="text-right">
            {checkingAccess ? (
              <div className="flex items-center gap-2 text-warning">
                <Shield className="w-5 h-5 animate-pulse" />
                <span>Checking access...</span>
              </div>
            ) : hasAccess ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span>Subscribed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-error">
                <Lock className="w-5 h-5" />
                <span>Not subscribed</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Subscription Required Message */}
      {!hasAccess && isConnected && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card border-warning/30 bg-warning/5"
        >
          <div className="flex items-center gap-4">
            <Lock className="w-8 h-8 text-warning" />
            <div className="flex-1">
              <h3 className="font-semibold text-warning mb-1">Subscription Required</h3>
              <p className="text-text-muted text-sm">
                Subscribe to this creator's plan to access their premium content.
              </p>
            </div>
            <Link 
              to={`/creator/${creatorAddress}`}
              className="btn-secondary"
            >
              View Plans
            </Link>
          </div>
        </motion.div>
      )}

      {/* Not Authenticated Message */}
      {!isAuthenticated && isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card border-accent/30 bg-accent/5"
        >
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-accent" />
            <div className="flex-1">
              <h3 className="font-semibold text-accent mb-1">Sign In Required</h3>
              <p className="text-text-muted text-sm">
                Sign in with your wallet to check your subscription status and access content.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Content Library {hasAccess && <span className="text-accent">({contents.length})</span>}
          </h2>
          
          {hasAccess && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Zap className="w-4 h-4" />
              <span>Full Access</span>
            </div>
          )}
        </div>

        {contents.length === 0 ? (
          <div className="card text-center py-16">
            <FileText className="w-16 h-16 mx-auto mb-4 text-text-dimmed" />
            <h3 className="text-xl font-semibold mb-2">No Content Yet</h3>
            <p className="text-text-muted">This creator hasn't uploaded any content yet.</p>
          </div>
        ) : (
          <div className="content-grid">
            {contents.map((item, i) => (
              <motion.div
                key={item._id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card-interactive relative ${!hasAccess && 'cursor-not-allowed'}`}
                onClick={() => hasAccess && window.open(item.uri, '_blank')}
              >
                {/* Content Lock Overlay */}
                {!hasAccess && (
                  <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-warning" />
                      <p className="text-sm text-warning font-medium">Subscription Required</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getContentTypeColor(item.type || 'article')}`}>
                    {getContentIcon(item.type || 'article')}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-text-dimmed">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                
                <div className="text-xs text-text-dimmed mb-3 truncate">
                  {hasAccess ? item.uri : 'Content locked'}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getContentTypeColor(item.type || 'article')}`}>
                    {(item.type || 'article').toUpperCase()}
                  </span>
                  
                  {hasAccess && (
                    <div className="flex items-center gap-1 text-accent text-xs">
                      <ExternalLink className="w-3 h-3" />
                      <span>Open</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Subscribe CTA */}
      {!hasAccess && creatorData?.plans?.filter(p => p.active).length > 0 && (
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
              {creatorData.plans.filter(p => p.active).slice(0, 3).map((plan, i) => (
                <Link
                  key={plan.id || i}
                  to={`/creator/${creatorAddress}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card border border-accent/30 hover:border-accent transition-all duration-300"
                >
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-accent text-sm">{Number(plan.price) / 1e18} WMON</div>
                  </div>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}