import { Category } from '@/types/book';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  categories: Category[];
  activeCategory: number | null;
  onCategorySelect: (categoryId: number) => void;
}

export function TableOfContents({ 
  categories, 
  activeCategory, 
  onCategorySelect 
}: TableOfContentsProps) {
  return (
    <nav className="space-y-1">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md text-sm font-medium',
            'transition-colors duration-150 ease-in-out',
            activeCategory === category.id
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {category.title}
        </button>
      ))}
    </nav>
  );
} 