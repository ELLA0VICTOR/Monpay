import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Star, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { creator, subscription } from '../utils/api';
import CreatorCard from '../components/CreatorCard.jsx';
import PlanCard from '../components/PlanCard.jsx';
import useContract from '../hooks/useContract.js';
import { useAccount } from 'wagmi';
import useMetaTransaction from '../hooks/useMetaTransaction.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function Marketplace() {
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [subscribing, setSubscribing] = useState(null);
  
  const { address, isConnected } = useAccount();
  const { contract } = useContract();
  const meta = useMetaTransaction(contract);
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (selected?.owner && selected.owner !== selected.address) {
      loadCreatorDetails(selected.owner || selected.address);
    }
  }, [selected]);

  useEffect(() => {
    filterCreators();
  }, [creators, searchTerm, sortBy]);

  async function loadCreators() {
    try {
      setLoading(true);
      const { data } = await creator.getAll();
      const creatorsArray = Array.isArray(data) ? data : [];
      
      // Ensure each creator has required fields
      const normalizedCreators = creatorsArray.map(c => ({
        ...c,
        owner: c.owner || c.address || c.walletAddress,
        displayName: c.displayName || `Creator ${c.owner?.slice(0, 6) || ''}`,
        bio: c.bio || 'No bio available',
        analytics: c.analytics || { subscribers: 0, contentCount: 0, revenue: 0 },
        plans: c.plans || [],
        createdAt: c.createdAt || new Date().toISOString()
      }));
      
      setCreators(normalizedCreators);
      if (normalizedCreators.length > 0 && !selected) {
        setSelected(normalizedCreators[0]);
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
      toast.error('Failed to load creators from backend');
      // Set empty array instead of keeping loading
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCreatorDetails(creatorAddress) {
    try {
      const { data } = await creator.getDetails(creatorAddress);
      if (data) {
        const normalizedCreator = {
          ...data,
          owner: data.owner || data.address || creatorAddress,
          displayName: data.displayName || `Creator ${creatorAddress?.slice(0, 6) || ''}`,
          bio: data.bio || 'No bio available',
          analytics: data.analytics || { subscribers: 0, contentCount: 0, revenue: 0 },
          plans: data.plans || [],
          createdAt: data.createdAt || new Date().toISOString()
        };
        setSelected(normalizedCreator);
      }
    } catch (error) {
      console.error('Failed to load creator details:', error);
      // Don't show error toast for individual creator loads
    }
  }

  function filterCreators() {
    let filtered = creators.filter(creator =>
      creator.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort creators
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.analytics?.subscribers || 0) - (a.analytics?.subscribers || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'content':
        filtered.sort((a, b) => (b.analytics?.contentCount || 0) - (a.analytics?.contentCount || 0));
        break;
    }

    setFilteredCreators(filtered);
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
      
      // Encode meta transaction for subscribe(planId, periods, autoRenew)
      const data = meta.encode(contract.abi, 'subscribe', [
        plan.id || plan.planId || 0, 
        1, // 1 period
        true // auto-renew enabled
      ]);
      
      const res = await meta.sendMeta(address, contract.address, data);
      
      // Create subscription record in backend
      try {
        await subscription.create({
          subscriber: address,
          creator: selected.owner,
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
        // Continue anyway, blockchain tx succeeded
      }
      
      toast.success('Subscription successful!', { id: toastId });
      
      // Refresh creator data
      if (selected?.owner) {
        loadCreatorDetails(selected.owner);
      }
      
    } catch (error) {
      console.error('Subscription failed:', error);
      toast.error('Subscription failed: ' + (error.message || 'Unknown error'));
    } finally {
      setSubscribing(null);
    }
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Creator <span className="gradient-text">Marketplace</span>
        </h1>
        <p className="text-xl text-text-muted">
          Discover amazing creators and subscribe to premium content
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-dimmed" />
            <input
              type="text"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-auto min-w-[140px]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="content">Most Content</option>
            </select>
            
            <button className="btn-secondary px-4">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Creators List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Creators ({filteredCreators.length})</h2>
          </div>
          
          {filteredCreators.length === 0 ? (
            <div className="card text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-text-dimmed" />
              <p className="text-text-muted mb-4">
                {creators.length === 0 ? 'No creators found on the platform' : 'No creators match your search'}
              </p>
              {creators.length === 0 && (
                <Link to="/creator" className="btn btn-sm">
                  Be the First Creator
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCreators.map((creatorItem, idx) => (
                <motion.div
                  key={creatorItem.owner || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CreatorCard
                    creator={creatorItem}
                    isSelected={selected?.owner === creatorItem.owner}
                    onClick={() => setSelected(creatorItem)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Plans Display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="space-y-6">
              {/* Creator Header */}
              <div className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selected.displayName}</h2>
                    <p className="text-text-muted mb-4">{selected.bio}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>{selected.analytics?.subscribers || 0} subscribers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-accent" />
                        <span>{selected.analytics?.contentCount || 0} contents</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>Active since {new Date(selected.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-xl">
                    {selected.displayName?.charAt(0) || 'C'}
                  </div>
                </div>
              </div>

              {/* Subscription Plans */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Subscription Plans</h3>
                {selected.plans?.filter(p => p.active)?.length > 0 ? (
                  <div className="grid gap-4">
                    {selected.plans.filter(p => p.active).map((plan, idx) => (
                      <motion.div
                        key={plan.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <PlanCard
                          plan={plan}
                          isSubscribing={subscribing === (plan.id || plan.planId)}
                          onSubscribe={() => subscribe(plan)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="card text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-text-dimmed" />
                    <p className="text-text-muted">No active plans available</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <Users className="w-16 h-16 mx-auto mb-4 text-text-dimmed" />
              <h3 className="text-xl font-semibold mb-2">Select a Creator</h3>
              <p className="text-text-muted mb-6">
                Choose a creator from the left to view their subscription plans
              </p>
              {filteredCreators.length === 0 && (
                <Link to="/creator" className="btn">
                  Become a Creator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}