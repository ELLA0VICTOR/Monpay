import { motion } from 'framer-motion';
import { Clock, Users, Zap, Loader2 } from 'lucide-react';

export default function PlanCard({ plan, isSubscribing, onSubscribe }) {
  const price = Number(plan.price) / 1e18;
  const period = Number(plan.period);
  const periodText = period >= 2592000 ? `${period / 2592000} month(s)` : `${period / 86400} day(s)`;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="card group hover:border-accent/40 hover:shadow-neon-strong relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              {plan.description}
            </p>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium">
            <Clock className="w-3 h-3" />
            {periodText}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 text-sm text-text-muted">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{plan.subscriberCount || 0} subscribers</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Gasless</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold gradient-text">
              {price.toFixed(2)}
            </span>
            <span className="text-text-muted text-sm">WMON</span>
            <span className="text-text-dimmed text-xs">/ {periodText}</span>
          </div>
          
          <button
            onClick={onSubscribe}
            disabled={isSubscribing}
            className="btn btn-sm group/btn relative overflow-hidden"
          >
            {isSubscribing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : (
              <>
                Subscribe
                <div className="absolute inset-0 bg-gradient-to-r from-accent-light to-accent opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
              </>
            )}
          </button>
        </div>

        {/* Popular Badge */}
        {(plan.subscriberCount || 0) > 10 && (
          <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-accent text-white text-xs font-medium">
            Popular
          </div>
        )}
      </div>
    </motion.div>
  );
}