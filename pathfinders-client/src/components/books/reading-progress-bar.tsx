interface ReadingProgressBarProps {
  progress: number;
  category: string;
}

export function ReadingProgressBar({ progress, category }: ReadingProgressBarProps) {
  return (
    <div className="border-b bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Reading Progress: {Math.round(progress)}%
        </span>
        {category && (
          <span className="text-sm text-gray-500">
            Current Section: {category}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
} 