import { motion } from 'framer-motion';
import { 
  Lock, Play, FileText, Image, Headphones, 
  Calendar, ExternalLink, Eye
} from 'lucide-react';

export default function ContentCard({ item, isLocked = false, onOpen }) {
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
      case 'video': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'image': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'audio': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  }

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      className={`card-interactive relative overflow-hidden ${
        isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={onOpen}
    >
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-bg/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-sm text-warning font-medium">Subscribe to unlock</p>
          </div>
        </div>
      )}

      {/* Content Type Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${getContentTypeColor(item.type || 'article')}`}>
          {getContentIcon(item.type || 'article')}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-text-dimmed">
          <Calendar className="w-3 h-3" />
          {new Date(item.createdAt || Date.now()).toLocaleDateString()}
        </div>
      </div>

      {/* Content Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
          {item.title}
        </h3>
        
        <p className="text-text-dimmed text-sm truncate">
          {item.description || item.uri}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getContentTypeColor(item.type || 'article')}`}>
            {(item.type || 'article').toUpperCase()}
          </span>
          
          {!isLocked && (
            <div className="flex items-center gap-1 text-accent text-xs group-hover:translate-x-1 transition-transform">
              <Eye className="w-3 h-3" />
              <span>View</span>
            </div>
          )}
        </div>
      </div>

      {/* Premium Badge */}
      {!isLocked && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-accent/20 border border-accent/30 text-accent text-xs font-medium">
          Premium
        </div>
      )}
    </motion.div>
  );
}