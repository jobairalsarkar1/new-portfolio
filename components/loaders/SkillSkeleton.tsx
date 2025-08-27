const SkillSkeleton = () => {
  return (
    <div className="mt-4 flex gap-3 flex-wrap items-center justify-center">
      {Array.from({ length: 26 }).map((_, index) => (
        <div
          key={index}
          className="w-12 h-12 border-2 border-gray-700 rounded-lg bg-gradient-to-br from-gray-900 via-black to-gray-800 animate-pulse"
          style={{ animationDelay: `${index * 0.5}s` }}
        />
      ))}
    </div>
  );
};

export default SkillSkeleton;
