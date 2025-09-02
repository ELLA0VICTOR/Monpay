export default function LoadingSkeleton() {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="loading-pulse h-12 w-64 mx-auto"></div>
          <div className="loading-pulse h-6 w-96 mx-auto"></div>
        </div>
  
        {/* Search Bar Skeleton */}
        <div className="card">
          <div className="flex gap-4">
            <div className="loading-pulse h-12 flex-1"></div>
            <div className="loading-pulse h-12 w-32"></div>
            <div className="loading-pulse h-12 w-12"></div>
          </div>
        </div>
  
        {/* Content Grid Skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Creators List Skeleton */}
          <div className="space-y-4">
            <div className="loading-pulse h-6 w-32"></div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="flex gap-4">
                  <div className="loading-pulse w-12 h-12 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="loading-pulse h-5 w-24"></div>
                    <div className="loading-pulse h-4 w-full"></div>
                    <div className="flex gap-4">
                      <div className="loading-pulse h-3 w-12"></div>
                      <div className="loading-pulse h-3 w-12"></div>
                      <div className="loading-pulse h-3 w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          {/* Plans Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="loading-pulse h-8 w-48"></div>
                  <div className="loading-pulse h-5 w-64"></div>
                </div>
                <div className="loading-pulse w-16 h-16 rounded-full"></div>
              </div>
              <div className="flex gap-6">
                <div className="loading-pulse h-4 w-20"></div>
                <div className="loading-pulse h-4 w-20"></div>
                <div className="loading-pulse h-4 w-20"></div>
              </div>
            </div>
  
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card">
                <div className="flex justify-between mb-4">
                  <div className="space-y-2">
                    <div className="loading-pulse h-6 w-32"></div>
                    <div className="loading-pulse h-4 w-48"></div>
                  </div>
                  <div className="loading-pulse h-6 w-16"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="loading-pulse h-8 w-24"></div>
                  <div className="loading-pulse h-10 w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }