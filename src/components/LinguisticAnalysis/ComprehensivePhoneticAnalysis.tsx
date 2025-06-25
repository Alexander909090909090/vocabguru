
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Volume2, 
  Mic, 
  Waveform, 
  Globe2,
  Music,
  Headphones,
  Map
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AdvancedLinguisticProcessor } from '@/services/advancedLinguisticProcessor';

interface PhoneticAnalysis {
  word: string;
  ipaTranscription: string;
  phonemes: {
    symbol: string;
    description: string;
    position: number;
    type: 'consonant' | 'vowel';
  }[];
  syllableStructure: string;
  syllableCount: number;
  stressPattern: string;
  prosodyFeatures: {
    rhythm: string;
    intonation: string;
    tone?: string;
  };
  soundChanges: {
    type: string;
    description: string;
    historicalPeriod?: string;
  }[];
  regionalPronunciations: {
    region: string;
    ipa: string;
    notes?: string;
    audioSample?: string;
  }[];
  rhymeScheme?: string;
  phoneticComplexity: 'simple' | 'moderate' | 'complex' | 'highly_complex';
}

interface ComprehensivePhoneticAnalysisProps {
  word: string;
  onPronunciationPlay?: (ipa: string, region?: string) => void;
}

export const ComprehensivePhoneticAnalysis: React.FC<ComprehensivePhoneticAnalysisProps> = ({
  word,
  onPronunciationPlay
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('transcription');

  const { data: phoneticData, isLoading, error } = useQuery({
    queryKey: ['comprehensive-phonetic-analysis', word],
    queryFn: async () => {
      const result = await AdvancedLinguisticProcessor.analyzeWord({
        word,
        options: {
          includePhonetic: true
        }
      });

      if (result.success && result.analysis) {
        return parsePhoneticData(result.analysis, word);
      } else {
        return generateFallbackPhonetic(word);
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const parsePhoneticData = (data: any, targetWord: string): PhoneticAnalysis => {
    const phonetic = data.phonetic_data;
    
    return {
      word: targetWord,
      ipaTranscription: phonetic?.ipa_transcription || generateBasicIPA(targetWord),
      phonemes: phonetic?.phonemes || [],
      syllableStructure: phonetic?.syllable_structure || 'CVCV',
      syllableCount: phonetic?.syllable_count || countSyllables(targetWord),
      stressPattern: phonetic?.stress_pattern || 'primary-secondary',
      prosodyFeatures: {
        rhythm: 'stress-timed',
        intonation: 'falling',
        tone: phonetic?.tone
      },
      soundChanges: phonetic?.sound_changes || [],
      regionalPronunciations: phonetic?.regional_pronunciations || generateRegionalVariations(targetWord),
      rhymeScheme: phonetic?.rhyme_scheme,
      phoneticComplexity: determineComplexity(targetWord)
    };
  };

  const generateFallbackPhonetic = (targetWord: string): PhoneticAnalysis => {
    return {
      word: targetWord,
      ipaTranscription: generateBasicIPA(targetWord),
      phonemes: generateBasicPhonemes(targetWord),
      syllableStructure: 'CVCV',
      syllableCount: countSyllables(targetWord),
      stressPattern: 'primary',
      prosodyFeatures: {
        rhythm: 'stress-timed',
        intonation: 'falling'
      },
      soundChanges: [],
      regionalPronunciations: generateRegionalVariations(targetWord),
      phoneticComplexity: determineComplexity(targetWord)
    };
  };

  const generateBasicIPA = (word: string): string => {
    // Simplified IPA generation for demonstration
    return `/${word.toLowerCase().replace(/[aeiou]/g, 'ə')}/`;
  };

  const generateBasicPhonemes = (word: string) => {
    return word.split('').map((char, index) => ({
      symbol: char.toLowerCase(),
      description: isVowel(char) ? 'Vowel sound' : 'Consonant sound',
      position: index,
      type: isVowel(char) ? 'vowel' as const : 'consonant' as const
    }));
  };

  const isVowel = (char: string): boolean => {
    return 'aeiouAEIOU'.includes(char);
  };

  const countSyllables = (word: string): number => {
    return word.toLowerCase().match(/[aeiouy]+/g)?.length || 1;
  };

  const determineComplexity = (word: string): PhoneticAnalysis['phoneticComplexity'] => {
    const length = word.length;
    const syllableCount = countSyllables(word);
    
    if (length <= 4 && syllableCount <= 2) return 'simple';
    if (length <= 7 && syllableCount <= 3) return 'moderate';
    if (length <= 10 && syllableCount <= 4) return 'complex';
    return 'highly_complex';
  };

  const generateRegionalVariations = (word: string) => {
    return [
      {
        region: 'General American',
        ipa: generateBasicIPA(word),
        notes: 'Standard American pronunciation'
      },
      {
        region: 'Received Pronunciation',
        ipa: generateBasicIPA(word).replace('ə', 'ɑː'),
        notes: 'British standard pronunciation'
      },
      {
        region: 'Australian English',
        ipa: generateBasicIPA(word).replace('ə', 'æ'),
        notes: 'Australian variant'
      }
    ];
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'complex': return 'bg-yellow-100 text-yellow-800';
      case 'highly_complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const playPronunciation = (ipa: string, region?: string) => {
    onPronunciationPlay?.(ipa, region);
    // Here you would integrate with a TTS service or audio API
    console.log(`Playing pronunciation: ${ipa} (${region || 'default'})`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Waveform className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Analyzing phonetic structure...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !phoneticData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Volume2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Unable to analyze phonetic structure</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phonetic Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Comprehensive Phonetic Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">{phoneticData.word}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playPronunciation(phoneticData.ipaTranscription)}
                className="flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Play
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getComplexityColor(phoneticData.phoneticComplexity)}>
                {phoneticData.phoneticComplexity.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {phoneticData.syllableCount} syllables
              </Badge>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="h-4 w-4" />
              <span className="font-medium">IPA Transcription</span>
            </div>
            <span className="text-2xl font-mono">{phoneticData.ipaTranscription}</span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transcription">Phonemes</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="prosody">Prosody</TabsTrigger>
        </TabsList>

        <TabsContent value="transcription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Phonemic Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {phoneticData.phonemes.map((phoneme, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono">{phoneme.symbol}</span>
                      <div>
                        <p className="font-medium">{phoneme.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Position: {phoneme.position + 1}
                        </p>
                      </div>
                    </div>
                    <Badge variant={phoneme.type === 'vowel' ? 'default' : 'outline'}>
                      {phoneme.type}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Syllabic Structure & Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Syllable Structure</h4>
                  <p className="text-lg font-mono">{phoneticData.syllableStructure}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Stress Pattern</h4>
                  <p className="text-lg">{phoneticData.stressPattern}</p>
                </div>
              </div>

              {phoneticData.rhymeScheme && (
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Rhyme Scheme</h4>
                  <p className="text-lg">{phoneticData.rhymeScheme}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Regional Pronunciation Variants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {phoneticData.regionalPronunciations.map((variant, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRegion === variant.region ? 'border-primary bg-primary/5' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRegion(variant.region)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{variant.region}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPronunciation(variant.ipa, variant.region);
                        }}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-lg font-mono mb-1">{variant.ipa}</p>
                    {variant.notes && (
                      <p className="text-sm text-muted-foreground">{variant.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prosody" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waveform className="h-5 w-5" />
                Prosodic Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Rhythm</h4>
                  <p className="text-lg">{phoneticData.prosodyFeatures.rhythm}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Intonation</h4>
                  <p className="text-lg">{phoneticData.prosodyFeatures.intonation}</p>
                </div>
              </div>

              {phoneticData.prosodyFeatures.tone && (
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Tone</h4>
                  <p className="text-lg">{phoneticData.prosodyFeatures.tone}</p>
                </div>
              )}

              {phoneticData.soundChanges.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Historical Sound Changes</h4>
                  {phoneticData.soundChanges.map((change, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{change.type}</span>
                        {change.historicalPeriod && (
                          <Badge variant="outline">{change.historicalPeriod}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{change.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
