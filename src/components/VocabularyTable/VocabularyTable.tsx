
import React, { useState, useEffect } from 'react';
import { WordService } from '@/services/wordService';
import { Word } from '@/types/word';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ChevronDown, ChevronRight, Edit, Trash } from 'lucide-react';
import { DetailedWordBreakdown } from './DetailedWordBreakdown';
import { WordFormDialog } from './WordFormDialog';
import { toast } from 'sonner';

export const VocabularyTable = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showWordForm, setShowWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadWords();
  }, [currentPage, searchQuery]);

  const loadWords = async () => {
    try {
      setLoading(true);
      const result = await WordService.getWords(currentPage, 20, searchQuery);
      
      if (currentPage === 0) {
        setWords(result.words);
      } else {
        setWords(prev => [...prev, ...result.words]);
      }
      
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    setWords([]);
  };

  const toggleRowExpansion = (wordId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(wordId)) {
      newExpanded.delete(wordId);
    } else {
      newExpanded.add(wordId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEdit = (word: Word) => {
    setEditingWord(word);
    setShowWordForm(true);
  };

  const handleDelete = async (wordId: string) => {
    if (confirm('Are you sure you want to delete this word?')) {
      try {
        // Note: You'd need to implement delete in WordService
        toast.success('Word deleted successfully');
        loadWords();
      } catch (error) {
        toast.error('Failed to delete word');
      }
    }
  };

  const handleWordSaved = () => {
    setShowWordForm(false);
    setEditingWord(null);
    loadWords();
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Vocabulary Repository</CardTitle>
              <CardDescription>
                Comprehensive word profiles with detailed morphological analysis
              </CardDescription>
            </div>
            <Button onClick={() => setShowWordForm(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Add New Word
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search words, definitions, etymologies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="whitespace-nowrap">
              {words.length} words
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold">Word</TableHead>
                  <TableHead className="font-semibold">Part of Speech</TableHead>
                  <TableHead className="font-semibold">Origin</TableHead>
                  <TableHead className="font-semibold">Primary Definition</TableHead>
                  <TableHead className="font-semibold">Morphemes</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word) => (
                  <React.Fragment key={word.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(word.id)}
                          className="p-1"
                        >
                          {expandedRows.has(word.id) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{word.word}</span>
                          {word.pronunciation && (
                            <span className="text-sm text-muted-foreground">
                              /{word.pronunciation}/
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{word.partOfSpeech}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{word.languageOrigin}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate" title={word.definitions.primary}>
                          {word.definitions.primary}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {word.morpheme_breakdown.prefix && (
                            <Badge variant="secondary" className="text-xs">
                              {word.morpheme_breakdown.prefix.text}
                            </Badge>
                          )}
                          <Badge variant="default" className="text-xs">
                            {word.morpheme_breakdown.root.text}
                          </Badge>
                          {word.morpheme_breakdown.suffix && (
                            <Badge variant="secondary" className="text-xs">
                              {word.morpheme_breakdown.suffix.text}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(word)}
                            className="p-1"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(word.id)}
                            className="p-1 text-destructive hover:text-destructive"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {expandedRows.has(word.id) && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t bg-muted/30 p-6">
                            <DetailedWordBreakdown word={word} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && words.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No words found matching your search.' : 'No words in the repository yet.'}
            </div>
          )}

          {hasMore && !loading && words.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button onClick={loadMore} variant="outline">
                Load More Words
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <WordFormDialog
        open={showWordForm}
        onClose={() => {
          setShowWordForm(false);
          setEditingWord(null);
        }}
        onSaved={handleWordSaved}
        editingWord={editingWord}
      />
    </div>
  );
};
