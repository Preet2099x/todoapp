export default function SkeletonAuth() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Image Skeleton */}
        <div className="relative hidden lg:block">
          <div className="w-full h-full bg-slate-200 animate-pulse"></div>
        </div>

        {/* Right Side - Form Skeleton */}
        <div className="flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-md py-4">
            {/* Mobile Header Skeleton - Only visible on small screens */}
            <div className="text-center mb-6 lg:hidden">
              <div className="w-16 h-16 mx-auto bg-slate-200 rounded-2xl animate-pulse mb-4"></div>
              <div className="h-8 bg-slate-200 rounded-md animate-pulse mb-2 mx-8"></div>
              <div className="h-4 bg-slate-200 rounded-md animate-pulse mx-4"></div>
            </div>

            {/* Desktop Header Skeleton */}
            <div className="text-center mb-3 hidden lg:block">
              <div className="h-8 bg-slate-200 rounded-md animate-pulse mb-2 mx-16"></div>
              <div className="h-4 bg-slate-200 rounded-md animate-pulse mx-8"></div>
            </div>

            {/* Form Card Skeleton */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
              <div className="space-y-4">
                {/* Input Field Skeletons */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div>
                    <div className="h-12 bg-slate-200 rounded-2xl animate-pulse"></div>
                  </div>
                ))}

                {/* Button Skeleton */}
                <div className="h-12 bg-slate-200 rounded-2xl animate-pulse"></div>
              </div>

              {/* Link Skeleton */}
              <div className="mt-8 text-center">
                <div className="h-4 bg-slate-200 rounded animate-pulse mx-8"></div>
              </div>
            </div>

            {/* Footer Skeleton */}
            <div className="text-center mt-8">
              <div className="h-3 bg-slate-200 rounded animate-pulse mx-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}