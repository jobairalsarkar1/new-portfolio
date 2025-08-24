import { FiLoader } from "react-icons/fi";

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-[#0a0f1a] overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,black)]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-600/20 rounded-full filter blur-xl animate-float" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gray-700/10 rounded-full filter blur-xl animate-float-delay" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md mx-auto">
          {/* Animated loader with orbit */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-gray-600/30 animate-spin-slow" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full" />
            <FiLoader className="w-12 h-12 text-gray-400 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            <span className="bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">
              Jobair Al Sarkar
            </span>{" "}
            Loading
          </h1>

          <p className="text-gray-400 mb-8">Have patience please...</p>

          {/* Animated progress dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gray-400 rounded-full"
                style={{
                  animation: `pulse 1.5s infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
