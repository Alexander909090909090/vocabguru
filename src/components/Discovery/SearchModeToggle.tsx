
import { Button } from '@/components/ui/button';
import { BookOpen, Search } from 'lucide-react';

interface SearchModeToggleProps {
  searchMode: 'smart' | 'browse';
  onModeChange: (mode: 'smart' | 'browse') => void;
}

export function SearchModeToggle({ searchMode, onModeChange }: SearchModeToggleProps) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={searchMode === 'browse' ? 'default' : 'outline'}
        onClick={() => onModeChange('browse')}
        className="flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" />
        Browse Words
      </Button>
      <Button
        variant={searchMode === 'smart' ? 'default' : 'outline'}
        onClick={() => onModeChange('smart')}
        className="flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        Smart Search
      </Button>
    </div>
  );
}

export default SearchModeToggle;
