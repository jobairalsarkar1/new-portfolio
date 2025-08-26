const SkillSkeleton = () => {
  return (
    <div className="mt-4 flex gap-3 flex-wrap items-center justify-center">
      {Array.from({ length: 26 }).map((_, index) => (
        <div
          key={index}
          className="w-12 h-12 border rounded-lg bg-gray-800 animate-pulse"
          style={{ animationDelay: `${index * 0.5}s` }}
        />
      ))}
    </div>
  );
};

export default SkillSkeleton;
