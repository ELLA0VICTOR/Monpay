import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, FileText, Image, Play, Headphones,
  Link as LinkIcon, AlertCircle, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadModal({ isOpen, onClose, onUpload, loading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    uri: '',
    type: 'article',
    tags: []
  });

  const [dragActive, setDragActive] = useState(false);
  const [urlValid, setUrlValid] = useState(null);

  const contentTypes = [
    { value: 'article', label: 'Article', icon: <FileText className="w-4 h-4" />, color: 'text-purple-400' },
    { value: 'video', label: 'Video', icon: <Play className="w-4 h-4" />, color: 'text-red-400' },
    { value: 'image', label: 'Image', icon: <Image className="w-4 h-4" />, color: 'text-green-400' },
    { value: 'audio', label: 'Audio', icon: <Headphones className="w-4 h-4" />, color: 'text-blue-400' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.uri) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await onUpload(formData);
      setFormData({
        title: '',
        description: '',
        uri: '',
        type: 'article',
        tags: []
      });
      onClose();
    } catch (error) {
      // Error handled by parent component
    }
  };

  const validateUrl = async (url) => {
    if (!url) {
      setUrlValid(null);
      return;
    }

    try {
      // Simple URL validation
      new URL(url);
      setUrlValid(true);
    } catch {
      setUrlValid(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Upload className="w-6 h-6 text-accent" />
                Upload Content
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-card-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Content Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {contentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.type === type.value
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className={`${type.color} mb-2`}>{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter content title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe your content..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[100px] resize-none"
                />
              </div>

              {/* Content URI */}
              <div>
                {/* Changed to flex to avoid block+flex Tailwind conflict */}
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <LinkIcon className="w-4 h-4" />
                  <span>Content URL</span>
                  <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://ipfs.io/ipfs/... or https://arweave.net/..."
                    value={formData.uri}
                    onChange={(e) => {
                      setFormData({ ...formData, uri: e.target.value });
                      validateUrl(e.target.value);
                    }}
                    className={`input pr-10 ${
                      urlValid === true ? 'border-success/50' :
                        urlValid === false ? 'border-error/50' : ''
                    }`}
                  />
                  {urlValid !== null && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {urlValid ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-error" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-dimmed mt-2">
                  Upload your content to IPFS, Arweave, or any decentralized storage platform
                </p>
              </div>

              {/* File Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-text-dimmed" />
                <p className="text-text-muted mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-xs text-text-dimmed">
                  Files will be uploaded to IPFS automatically
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    // File upload logic would go here
                    toast.info('File upload integration coming soon!');
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn flex-1"
                  disabled={loading || !formData.title || !formData.uri}
                >
                  {loading ? 'Uploading...' : 'Upload Content'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
