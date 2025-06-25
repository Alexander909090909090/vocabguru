
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, Play, Pause } from "lucide-react";
import { useState } from "react";

interface PhoneticAnalysis {
  ipa_transcription: string;
  stress_pattern: string;
  syllable_count: number;
  rhyme_scheme: string;
}

interface PhoneticAnalysisTabProps {
  word: string;
  analysis?: PhoneticAnalysis;
}

export function PhoneticAnalysisTab({ word, analysis }: PhoneticAnalysisTabProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playPronunciation = () => {
    // Use Web Speech API for pronunciation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopPronunciation = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!analysis) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8 text-center">
          <p className="text-white/80">Phonetic analysis not available for this word.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pronunciation Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Pronunciation & IPA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="space-y-2">
              <div className="text-2xl text-white font-mono">
                /{analysis.ipa_transcription}/
              </div>
              <div className="text-white/70 text-sm">
                International Phonetic Alphabet (IPA) transcription
              </div>
            </div>
            <Button
              onClick={isPlaying ? stopPronunciation : playPronunciation}
              variant="outline"
              size="sm"
              className="bg-primary/20 border-primary/30 text-primary hover:bg-primary/30"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Listen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stress and Syllable Pattern */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Stress & Syllable Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-white/70 text-sm mb-2">Stress Pattern</div>
              <div className="text-white font-medium text-lg">
                {analysis.stress_pattern}
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-white/70 text-sm mb-2">Syllable Count</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  {analysis.syllable_count} syllable{analysis.syllable_count !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>

          {analysis.rhyme_scheme && (
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-white/70 text-sm mb-2">Rhyme Pattern</div>
              <div className="text-white font-medium">
                {analysis.rhyme_scheme}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phonetic Features */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Phonetic Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/80 text-sm">
                <strong>Vowel Sounds:</strong> Extracted from IPA transcription
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/80 text-sm">
                <strong>Consonant Clusters:</strong> Identify complex consonant combinations
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/80 text-sm">
                <strong>Pronunciation Difficulty:</strong> Challenging sounds for language learners
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
