import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ArrowRight, Zap, Shield, Repeat, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Gasless Payments",
      description: "Zero gas fees for users. We handle all transaction costs on Monad Testnet."
    },
    {
      icon: <Repeat className="w-8 h-8" />,
      title: "Smart Recurring",
      description: "Automated monthly subscriptions with smart contract reliability."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Decentralized",
      description: "Built on Monad blockchain with meta-transaction security."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Creator Analytics",
      description: "Comprehensive dashboard to track revenue and subscriber growth."
    }
  ];

  const stats = [
    { label: "Active Creators", value: "150+", icon: <Users className="w-5 h-5" /> },
    { label: "Total Revenue", value: "$12.5K", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Subscriptions", value: "2.8K", icon: <Repeat className="w-5 h-5" /> },
    { label: "Gas Saved", value: "100%", icon: <Zap className="w-5 h-5" /> }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 mesh-bg opacity-50"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6">
              <span className="gradient-text">Gasless</span>{' '}
              <span className="text-white">Subscriptions</span>
              <br />
              <span className="text-white">on</span>{' '}
              <span className="gradient-text">Monad</span>
            </h1>
            
            <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              The future of creator monetization. Zero gas fees, automated renewals, 
              and seamless Web3 payments powered by Monad Testnet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to={isConnected ? "/marketplace" : "/marketplace"}
                className="btn text-lg px-8 py-4 group"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to={isConnected ? "/creator" : "/creator"}
                className="btn-secondary text-lg px-8 py-4"
              >
                Start Creating
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent2/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, i) => (
              <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center justify-center mb-2 text-accent">
                  {stat.icon}
                </div>
                <div className="text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">MonPay</span>?
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Revolutionary features that make Web3 subscriptions effortless for both creators and subscribers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="card group hover:bg-card-hover"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-text-muted leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-text-muted">Simple steps to get started</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Connect Wallet", desc: "Link your Web3 wallet to get started" },
              { step: "02", title: "Choose Plan", desc: "Browse creators and select subscription plans" },
              { step: "03", title: "Enjoy Content", desc: "Access premium content with automatic renewals" }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent text-xl font-bold mb-4 glow-border">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-text-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Revolutionize</span> Subscriptions?
            </h2>
            <p className="text-xl text-text-muted mb-8">
              Join creators and subscribers building the future of Web3 monetization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/creator" className="btn text-lg px-8 py-4">
                Become a Creator
              </Link>
              <Link to="/marketplace" className="btn-secondary text-lg px-8 py-4">
                Browse Content
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}