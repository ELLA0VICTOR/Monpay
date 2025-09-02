import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  Plus, Upload, BarChart3, Users, DollarSign, 
  FileText, Settings, Eye, EyeOff, Trash2, Edit3,
  TrendingUp, Calendar, Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { creator, content, auth } from '../utils/api';
import useContract from '../hooks/useContract.js';
import useMetaTransaction from '../hooks/useMetaTransaction.js';
import { toWei } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function CreatorDashboard() {
  const { address, isConnected } = useAccount();
  const { contract } = useContract();
  const meta = useMetaTransaction(contract);
  const { isAuthenticated, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    subscribers: 0,
    revenue: 0,
    contentCount: 0,
    revenueData: [],
    subscriberData: []
  });
  
  const [plans, setPlans] = useState([]);
  const [contents, setContents] = useState([]);
  
  // Forms
  const [planForm, setPlanForm] = useState({
    price: '0.1',
    period: 2592000,
    name: 'Basic Plan',
    description: 'Monthly subscription plan'
  });
  
  const [contentForm, setContentForm] = useState({
    title: '',
    uri: '',
    type: 'article'
  });

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    socialLinks: user?.socialLinks || { twitter: '', website: '' }
  });

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        socialLinks: user.socialLinks || { twitter: '', website: '' }
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && address) {
      loadDashboardData();
    }
  }, [address, isAuthenticated]);

  async function loadDashboardData() {
    try {
      setInitialLoading(true);
      
      // Load creator data from backend
      const creatorData = await creator.getDetails(address).catch(() => ({ data: null }));
      
      if (creatorData?.data) {
        const data = creatorData.data;
        setAnalytics({
          subscribers: data.analytics?.subscribers || 0,
          revenue: data.analytics?.revenue || 0,
          contentCount: data.analytics?.contentCount || 0,
          revenueData: data.analytics?.revenueData || generateMockChartData(),
          subscriberData: data.analytics?.subscriberData || generateMockChartData()
        });
        setPlans(data.plans || []);
      }

      // Load creator's content
      const contentData = await content.getByCreator(address).catch(() => ({ data: [] }));
      setContents(Array.isArray(contentData?.data) ? contentData.data : []);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setInitialLoading(false);
    }
  }

  // Generate mock chart data for now (until we have real analytics)
  function generateMockChartData() {
    return [
      { month: 'Jan', revenue: 400, subscribers: 20 },
      { month: 'Feb', revenue: 300, subscribers: 25 },
      { month: 'Mar', revenue: 500, subscribers: 30 },
      { month: 'Apr', revenue: 700, subscribers: 35 },
      { month: 'May', revenue: 600, subscribers: 45 },
      { month: 'Jun', revenue: 800, subscribers: 50 }
    ];
  }

  async function createPlan() {
    if (!planForm.name || !planForm.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const toastId = toast.loading('Creating subscription plan...');
      
      const price = toWei(planForm.price);
      const data = meta.encode(contract.abi, 'createPlan', [
        price, 
        Number(planForm.period), 
        planForm.name, 
        planForm.description
      ]);
      
      const res = await meta.sendMeta(address, contract.address, data);
      
      // Also create plan record in backend
      try {
        await creator.updateProfile(address, {
          plans: [...plans, {
            name: planForm.name,
            description: planForm.description,
            price: price.toString(),
            period: planForm.period,
            active: true,
            subscriberCount: 0,
            createdAt: new Date().toISOString()
          }]
        });
      } catch (backendError) {
        console.error('Backend plan creation failed:', backendError);
        // Continue anyway, blockchain tx succeeded
      }
      
      toast.success('Plan created successfully!', { id: toastId });
      
      // Reset form
      setPlanForm({
        price: '0.1',
        period: 2592000,
        name: 'Basic Plan',
        description: 'Monthly subscription plan'
      });
      
      // Reload data
      await loadDashboardData();
      
    } catch (error) {
      console.error('Plan creation failed:', error);
      toast.error('Failed to create plan: ' + (error.message || 'Unknown error'));
    }
  }

  async function uploadContent() {
    if (!contentForm.title || !contentForm.uri) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const toastId = toast.loading('Uploading content...');
      
      // First upload to blockchain
      const data = meta.encode(contract.abi, 'uploadContent', [contentForm.uri, contentForm.title]);
      const res = await meta.sendMeta(address, contract.address, data);
      
      // Then save to backend
      await content.create({
        creator: address,
        uri: contentForm.uri,
        title: contentForm.title,
        type: contentForm.type,
        contentId: contents.length, // Simple ID for now
        active: true
      });
      
      toast.success('Content uploaded successfully!', { id: toastId });
      
      // Reset form
      setContentForm({ title: '', uri: '', type: 'article' });
      
      // Reload data
      await loadDashboardData();
      
    } catch (error) {
      console.error('Content upload failed:', error);
      toast.error('Failed to upload content: ' + (error.message || 'Unknown error'));
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      await creator.updateProfile(address, profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  async function deleteContent(contentId) {
    try {
      const toastId = toast.loading('Deleting content...');
      await content.delete(contentId);
      toast.success('Content deleted successfully!', { id: toastId });
      await loadDashboardData();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete content');
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'plans', label: 'Subscription Plans', icon: <FileText className="w-4 h-4" /> },
    { id: 'content', label: 'Content', icon: <Upload className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <Settings className="w-4 h-4" /> }
  ];

  if (initialLoading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="loading-pulse h-20 rounded-xl"></div>
        
        {/* Loading Tabs */}
        <div className="loading-pulse h-12 rounded-2xl"></div>
        
        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="loading-pulse h-24 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!isConnected || !isAuthenticated) {
    return (
      <div className="card text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-text-dimmed" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-text-muted mb-6">
          Connect your wallet and sign in to access the creator dashboard
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
            Creator <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-text-muted">
            Manage your content, track analytics, and grow your subscriber base
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('plans')}
            className="btn btn-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className="btn-secondary btn-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Content
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-card rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-glow'
                : 'text-text-muted hover:text-white hover:bg-card-hover'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Subscribers', value: analytics.subscribers || 0, icon: <Users className="w-6 h-6" />, color: 'text-blue-400' },
                { label: 'Monthly Revenue', value: `${(analytics.revenue || 0).toFixed(2)} WMON`, icon: <DollarSign className="w-6 h-6" />, color: 'text-green-400' },
                { label: 'Content Count', value: contents.length, icon: <FileText className="w-6 h-6" />, color: 'text-purple-400' },
                { label: 'Active Plans', value: plans.filter(p => p.active).length, icon: <TrendingUp className="w-6 h-6" />, color: 'text-accent' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="stat-card"
                >
                  <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-text-muted text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Revenue Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#141422', 
                          border: '1px solid rgba(139,92,246,0.3)',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Subscriber Growth
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.subscriberData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#141422', 
                          border: '1px solid rgba(139,92,246,0.3)',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="subscribers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Create Plan Form */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Create New Plan
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Plan Name</label>
                    <input
                      className="input"
                      placeholder="e.g., Premium Monthly"
                      value={planForm.name}
                      onChange={e => setPlanForm({...planForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (WMON)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.1"
                      value={planForm.price}
                      onChange={e => setPlanForm({...planForm, price: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="Describe what subscribers get..."
                      value={planForm.description}
                      onChange={e => setPlanForm({...planForm, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Billing Period</label>
                    <select
                      className="input"
                      value={planForm.period}
                      onChange={e => setPlanForm({...planForm, period: Number(e.target.value)})}
                    >
                      <option value={86400}>Daily (86400s)</option>
                      <option value={604800}>Weekly (604800s)</option>
                      <option value={2592000}>Monthly (2592000s)</option>
                      <option value={31536000}>Yearly (31536000s)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                onClick={createPlan}
                disabled={meta.loading}
                className="btn mt-6"
              >
                {meta.loading ? 'Creating...' : 'Create Plan'}
              </button>
            </div>

            {/* Existing Plans */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6">Your Plans ({plans.length})</h3>
              
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-text-dimmed" />
                  <p className="text-text-muted">No plans created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan, i) => (
                    <div key={i} className="glass p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-text-muted mb-2">{plan.description}</p>
                          <div className="flex items-center gap-4 text-xs text-text-dimmed">
                            <span>{Number(plan.price) / 1e18} WMON</span>
                            <span>{plan.subscriberCount || 0} subscribers</span>
                            <span className={plan.active ? 'text-success' : 'text-error'}>
                              {plan.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-accent/10 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-accent/10 rounded-lg transition-colors">
                            {plan.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* Upload Content Form */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent" />
                Upload New Content
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Title</label>
                    <input
                      className="input"
                      placeholder="Enter content title..."
                      value={contentForm.title}
                      onChange={e => setContentForm({...contentForm, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Type</label>
                    <select
                      className="input"
                      value={contentForm.type}
                      onChange={e => setContentForm({...contentForm, type: e.target.value})}
                    >
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Content URI</label>
                  <textarea
                    className="input min-h-[120px] resize-none"
                    placeholder="IPFS hash, Arweave link, or content URL..."
                    value={contentForm.uri}
                    onChange={e => setContentForm({...contentForm, uri: e.target.value})}
                  />
                  <p className="text-xs text-text-dimmed mt-2">
                    Upload to IPFS or Arweave for decentralized storage
                  </p>
                </div>
              </div>
              
              <button
                onClick={uploadContent}
                disabled={meta.loading}
                className="btn mt-6"
              >
                {meta.loading ? 'Uploading...' : 'Upload Content'}
              </button>
            </div>

            {/* Content List */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6">Your Content ({contents.length})</h3>
              
              {contents.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-text-dimmed" />
                  <p className="text-text-muted">No content uploaded yet</p>
                </div>
              ) : (
                <div className="content-grid">
                  {contents.map((item, i) => (
                    <div key={i} className="glass p-4 rounded-xl group hover:border-accent/30">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold truncate">{item.title}</h4>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => window.open(item.uri, '_blank')}
                            className="p-1 hover:bg-accent/10 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteContent(item._id || item.id)}
                            className="p-1 hover:bg-red-500/10 rounded transition-colors text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-text-dimmed mb-2 truncate">{item.uri}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-1 rounded bg-accent/10 text-accent">
                          {item.type || 'article'}
                        </span>
                        <span className="text-text-dimmed">
                          {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Profile Settings
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <input
                      className="input"
                      placeholder="Your creator name..."
                      value={profile.displayName}
                      onChange={e => setProfile({...profile, displayName: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      className="input min-h-[100px] resize-none"
                      placeholder="Tell your audience about yourself..."
                      value={profile.bio}
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar URL</label>
                    <input
                      className="input"
                      placeholder="https://..."
                      value={profile.avatar}
                      onChange={e => setProfile({...profile, avatar: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter</label>
                    <input
                      className="input"
                      placeholder="@username"
                      value={profile.socialLinks.twitter}
                      onChange={e => setProfile({
                        ...profile,
                        socialLinks: {...profile.socialLinks, twitter: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      className="input"
                      placeholder="https://yourwebsite.com"
                      value={profile.socialLinks.website}
                      onChange={e => setProfile({
                        ...profile,
                        socialLinks: {...profile.socialLinks, website: e.target.value}
                      })}
                    />
                  </div>
                  
                  {/* Profile Preview */}
                  <div className="glass p-4 rounded-xl">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold">
                        {profile.displayName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="font-medium">{profile.displayName || 'Creator Name'}</div>
                        <div className="text-xs text-text-muted">{profile.bio || 'No bio'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={updateProfile}
                disabled={loading}
                className="btn mt-6"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}