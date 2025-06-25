
import React, { useState, useEffect } from 'react';
import { Word } from '@/types/word';
import { WordService } from '@/services/wordService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface WordFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingWord?: Word | null;
}

export const WordFormDialog: React.FC<WordFormDialogProps> = ({
  open,
  onClose,
  onSaved,
  editingWord
}) => {
  const [formData, setFormData] = useState<Partial<Word>>({
    word: '',
    partOfSpeech: '',
    languageOrigin: '',
    pronunciation: '',
    definitions: {
      primary: '',
      standard: [''],
      extended: [''],
      contextual: [''],
      specialized: ['']
    },
    morpheme_breakdown: {
      root: { text: '', meaning: '' }
    },
    etymology: {
      historical_origins: '',
      language_of_origin: '',
      word_evolution: '',
      cultural_variations: ''
    },
    word_forms: {
      base_form: '',
      noun_forms: { singular: '', plural: '' },
      verb_tenses: { present: '', past: '', future: '', present_participle: '', past_participle: '' },
      adjective_forms: { positive: '', comparative: '', superlative: '' },
      adverb_form: '',
      other_inflections: ['']
    },
    analysis: {
      synonyms: [''],
      antonyms: [''],
      collocations: [''],
      cultural_significance: '',
      example_sentence: ''
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingWord) {
      setFormData(editingWord);
    } else {
      // Reset form for new word
      setFormData({
        word: '',
        partOfSpeech: '',
        languageOrigin: '',
        pronunciation: '',
        definitions: {
          primary: '',
          standard: [''],
          extended: [''],
          contextual: [''],
          specialized: ['']
        },
        morpheme_breakdown: {
          root: { text: '', meaning: '' }
        },
        etymology: {
          historical_origins: '',
          language_of_origin: '',
          word_evolution: '',
          cultural_variations: ''
        },
        word_forms: {
          base_form: '',
          noun_forms: { singular: '', plural: '' },
          verb_tenses: { present: '', past: '', future: '', present_participle: '', past_participle: '' },
          adjective_forms: { positive: '', comparative: '', superlative: '' },
          adverb_form: '',
          other_inflections: ['']
        },
        analysis: {
          synonyms: [''],
          antonyms: [''],
          collocations: [''],
          cultural_significance: '',
          example_sentence: ''
        }
      });
    }
  }, [editingWord, open]);

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const updateArrayItem = (path: string, index: number, value: string) => {
    const current = path.split('.').reduce((obj, key) => obj?.[key], formData) as string[];
    if (current) {
      const newArray = [...current];
      newArray[index] = value;
      updateFormData(path, newArray);
    }
  };

  const addArrayItem = (path: string) => {
    const current = path.split('.').reduce((obj, key) => obj?.[key], formData) as string[];
    if (current) {
      updateFormData(path, [...current, '']);
    }
  };

  const removeArrayItem = (path: string, index: number) => {
    const current = path.split('.').reduce((obj, key) => obj?.[key], formData) as string[];
    if (current && current.length > 1) {
      const newArray = current.filter((_, i) => i !== index);
      updateFormData(path, newArray);
    }
  };

  const handleSave = async () => {
    if (!formData.word?.trim()) {
      toast.error('Word is required');
      return;
    }

    setSaving(true);
    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        definitions: {
          ...formData.definitions,
          standard: formData.definitions?.standard?.filter(d => d.trim()) || [],
          extended: formData.definitions?.extended?.filter(d => d.trim()) || [],
          contextual: formData.definitions?.contextual?.filter(d => d.trim()) || [],
          specialized: formData.definitions?.specialized?.filter(d => d.trim()) || []
        },
        analysis: {
          ...formData.analysis,
          synonyms: formData.analysis?.synonyms?.filter(s => s.trim()) || [],
          antonyms: formData.analysis?.antonyms?.filter(a => a.trim()) || [],
          collocations: formData.analysis?.collocations?.filter(c => c.trim()) || []
        },
        word_forms: {
          ...formData.word_forms,
          other_inflections: formData.word_forms?.other_inflections?.filter(i => i.trim()) || []
        }
      };

      await WordService.createWord(cleanedData);
      toast.success(`Word ${editingWord ? 'updated' : 'created'} successfully`);
      onSaved();
    } catch (error) {
      console.error('Error saving word:', error);
      toast.error(`Failed to ${editingWord ? 'update' : 'create'} word`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingWord ? 'Edit Word' : 'Add New Word'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="word">Word *</Label>
                <Input
                  id="word"
                  value={formData.word || ''}
                  onChange={(e) => updateFormData('word', e.target.value)}
                  placeholder="Enter the word"
                />
              </div>
              <div>
                <Label htmlFor="pronunciation">Pronunciation</Label>
                <Input
                  id="pronunciation"
                  value={formData.pronunciation || ''}
                  onChange={(e) => updateFormData('pronunciation', e.target.value)}
                  placeholder="IPA notation"
                />
              </div>
              <div>
                <Label htmlFor="partOfSpeech">Part of Speech</Label>
                <Input
                  id="partOfSpeech"
                  value={formData.partOfSpeech || ''}
                  onChange={(e) => updateFormData('partOfSpeech', e.target.value)}
                  placeholder="noun, verb, adjective, etc."
                />
              </div>
              <div>
                <Label htmlFor="languageOrigin">Language of Origin</Label>
                <Input
                  id="languageOrigin"
                  value={formData.languageOrigin || ''}
                  onChange={(e) => updateFormData('languageOrigin', e.target.value)}
                  placeholder="Latin, Greek, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Morpheme Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Morpheme Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Prefix (optional)</Label>
                  <Input
                    value={formData.morpheme_breakdown?.prefix?.text || ''}
                    onChange={(e) => updateFormData('morpheme_breakdown.prefix.text', e.target.value)}
                    placeholder="Prefix text"
                  />
                  <Textarea
                    className="mt-2"
                    value={formData.morpheme_breakdown?.prefix?.meaning || ''}
                    onChange={(e) => updateFormData('morpheme_breakdown.prefix.meaning', e.target.value)}
                    placeholder="Prefix meaning"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Root *</Label>
                  <Input
                    value={formData.morpheme_breakdown?.root?.text || ''}
                    onChange={(e) => updateFormData('morpheme_breakdown.root.text', e.target.value)}
                    placeholder="Root text"
                  />
                  <Textarea
                    className="mt-2"
                    value={formData.morpheme_breakdown?.root?.meaning || ''}
                    onChange={(e) => updateFormData('morpheme_breakdown.root.meaning', e.target.value)}
                    placeholder="Root meaning"
                    rows={2}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Suffix (optional)</Label>
                  <Input
                    value={formData.morpheme_breakdown?.suffix?.text || ''}
                    onChange={(e) => updateFormData('morpheme_breakdown.suffix.text', e.target.value)}
                    placeholder="Suffix text"
                  />
                  <Textarea
                    className="mt-2"
                    value={formData.morpheme_breakdown?.suffix?.meaning || ''}
                    onChange={(e) => updateFormData('morpheme_breakdown.suffix.meaning', e.target.value)}
                    placeholder="Suffix meaning"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Definitions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Definitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryDef">Primary Definition *</Label>
                <Textarea
                  id="primaryDef"
                  value={formData.definitions?.primary || ''}
                  onChange={(e) => updateFormData('definitions.primary', e.target.value)}
                  placeholder="Main definition"
                  rows={2}
                />
              </div>

              {/* Standard Definitions */}
              <div>
                <Label>Standard Definitions</Label>
                {formData.definitions?.standard?.map((def, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Textarea
                      value={def}
                      onChange={(e) => updateArrayItem('definitions.standard', index, e.target.value)}
                      placeholder={`Definition ${index + 1}`}
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('definitions.standard', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('definitions.standard')}
                  className="mt-2"
                >
                  Add Definition
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Etymology */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Etymology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Historical Origins</Label>
                <Textarea
                  value={formData.etymology?.historical_origins || ''}
                  onChange={(e) => updateFormData('etymology.historical_origins', e.target.value)}
                  placeholder="Historical background and origins"
                  rows={3}
                />
              </div>
              <div>
                <Label>Word Evolution</Label>
                <Textarea
                  value={formData.etymology?.word_evolution || ''}
                  onChange={(e) => updateFormData('etymology.word_evolution', e.target.value)}
                  placeholder="How the word evolved over time"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Example Sentence</Label>
                <Textarea
                  value={formData.analysis?.example_sentence || ''}
                  onChange={(e) => updateFormData('analysis.example_sentence', e.target.value)}
                  placeholder="Example usage in a sentence"
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Synonyms</Label>
                {formData.analysis?.synonyms?.map((synonym, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={synonym}
                      onChange={(e) => updateArrayItem('analysis.synonyms', index, e.target.value)}
                      placeholder={`Synonym ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('analysis.synonyms', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('analysis.synonyms')}
                  className="mt-2"
                >
                  Add Synonym
                </Button>
              </div>

              <div>
                <Label>Common Collocations</Label>
                {formData.analysis?.collocations?.map((collocation, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={collocation}
                      onChange={(e) => updateArrayItem('analysis.collocations', index, e.target.value)}
                      placeholder={`Collocation ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('analysis.collocations', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('analysis.collocations')}
                  className="mt-2"
                >
                  Add Collocation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : (editingWord ? 'Update Word' : 'Create Word')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
