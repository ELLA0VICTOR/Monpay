import { Users, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatorCard({ creator, isSelected, onClick }) {
  const subscribers = creator.analytics?.subscribers || 0;
  const contentCount = creator.analytics?.contentCount || 0;
  const revenue = creator.analytics?.revenue || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`card-interactive transition-all duration-300 ${
        isSelected 
          ? 'border-accent shadow-neon bg-accent/5' 
          : 'hover:border-accent/30'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {creator.displayName?.charAt(0) || 'C'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold truncate">
              {creator.displayName || 'Unnamed Creator'}
            </h3>
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow"></div>
            )}
          </div>
          
          <p className="text-text-muted text-sm mb-3 line-clamp-2">
            {creator.bio || 'No bio available'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-accent" />
              <span className="text-text-muted">{subscribers}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-accent" />
              <span className="text-text-muted">{contentCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-accent" />
              <span className="text-text-muted">{revenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Plans Count */}
      {creator.plans?.filter(p => p.active)?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {creator.plans.filter(p => p.active).length} active plans
            </span>
            <span className="text-accent">View Plans →</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}