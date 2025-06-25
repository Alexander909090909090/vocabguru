
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  TreePine, 
  Waveform, 
  Timeline, 
  Layers, 
  ZoomIn,
  Download,
  Maximize2
} from 'lucide-react';

interface VisualizationData {
  morphologyTree: any;
  etymologyTimeline: any;
  semanticNetwork: any;
  phoneticPattern: any;
}

interface AdvancedVisualizationSystemProps {
  word: string;
  analysisData: any;
  onVisualizationChange?: (type: string, data: any) => void;
}

export const AdvancedVisualizationSystem: React.FC<AdvancedVisualizationSystemProps> = ({
  word,
  analysisData,
  onVisualizationChange
}) => {
  const [activeVisualization, setActiveVisualization] = useState('morphology');
  const [visualizationData, setVisualizationData] = useState<VisualizationData>({
    morphologyTree: null,
    etymologyTimeline: null,
    semanticNetwork: null,
    phoneticPattern: null
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (analysisData) {
      generateVisualizations();
    }
  }, [analysisData]);

  const generateVisualizations = () => {
    // Generate morphological tree visualization
    const morphologyTree = generateMorphologyTree();
    
    // Generate etymology timeline
    const etymologyTimeline = generateEtymologyTimeline();
    
    // Generate semantic network
    const semanticNetwork = generateSemanticNetwork();
    
    // Generate phonetic pattern
    const phoneticPattern = generatePhoneticPattern();

    setVisualizationData({
      morphologyTree,
      etymologyTimeline,
      semanticNetwork,
      phoneticPattern
    });
  };

  const generateMorphologyTree = () => {
    // Create interactive morphological tree structure
    const components = analysisData?.morphological_components || [];
    
    return {
      name: word,
      type: 'root',
      children: components.map((comp: any, index: number) => ({
        name: comp.text,
        type: comp.component_type,
        meaning: comp.meaning,
        origin: comp.origin_language,
        id: `morph-${index}`,
        depth: comp.component_type === 'root' ? 0 : 1,
        color: getMorphemeColor(comp.component_type)
      }))
    };
  };

  const generateEtymologyTimeline = () => {
    // Create timeline visualization for etymology
    const etymology = analysisData?.etymology_chain;
    
    if (!etymology) return null;

    const timelineEvents = [
      {
        date: etymology.first_attestation_date || '1000 CE',
        event: 'First Attestation',
        language: etymology.source_language,
        form: word,
        description: 'First recorded usage'
      },
      ...(etymology.historical_forms || []).map((form: any, index: number) => ({
        date: form.period || `${1200 + index * 200} CE`,
        event: 'Historical Form',
        language: form.language || etymology.source_language,
        form: form.form,
        description: form.meaning || 'Evolution of form'
      })),
      {
        date: '2024 CE',
        event: 'Modern Usage',
        language: 'English',
        form: word,
        description: 'Contemporary usage'
      }
    ];

    return {
      events: timelineEvents,
      totalSpan: timelineEvents.length > 1 ? 
        new Date().getFullYear() - parseInt(timelineEvents[0].date) : 1000
    };
  };

  const generateSemanticNetwork = () => {
    // Create semantic relationship network
    const relationships = analysisData?.word_relationships || [];
    const semanticData = analysisData?.semantic_relationships || [];

    const nodes = [
      {
        id: word,
        label: word,
        type: 'central',
        size: 20,
        color: '#3b82f6'
      },
      ...relationships.map((rel: any, index: number) => ({
        id: rel.target_word || `rel-${index}`,
        label: rel.target_word || `related-${index}`,
        type: rel.relationship_type,
        size: Math.max(8, (rel.strength || 0.5) * 16),
        color: getRelationshipColor(rel.relationship_type)
      }))
    ];

    const edges = relationships.map((rel: any, index: number) => ({
      source: word,
      target: rel.target_word || `rel-${index}`,
      type: rel.relationship_type,
      strength: rel.strength || 0.5,
      label: rel.relationship_type
    }));

    return { nodes, edges };
  };

  const generatePhoneticPattern = () => {
    // Create phonetic evolution visualization
    const phonetics = analysisData?.phonetic_data;
    
    if (!phonetics) return null;

    return {
      ipa: phonetics.ipa_transcription,
      phonemes: phonetics.phonemes || [],
      syllableStructure: phonetics.syllable_structure,
      stressPattern: phonetics.stress_pattern,
      soundChanges: phonetics.sound_changes || [],
      regionalVariations: phonetics.regional_pronunciations || []
    };
  };

  const getMorphemeColor = (type: string) => {
    const colors = {
      prefix: '#ef4444',
      root: '#22c55e',
      suffix: '#3b82f6',
      infix: '#f59e0b'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const getRelationshipColor = (type: string) => {
    const colors = {
      synonym: '#22c55e',
      antonym: '#ef4444',
      hypernym: '#3b82f6',
      hyponym: '#8b5cf6',
      meronym: '#f59e0b',
      holonym: '#ec4899'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const exportVisualization = (format: 'svg' | 'png' | 'json') => {
    // Export functionality for visualizations
    console.log(`Exporting ${activeVisualization} as ${format}`);
  };

  const MorphologyTreeVisualization = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Morphological Decomposition Tree</h3>
        <Button size="sm" variant="outline" onClick={() => exportVisualization('svg')}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      <div className="relative h-64 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">{word}</div>
            <div className="flex justify-center gap-4">
              {visualizationData.morphologyTree?.children?.map((component: any) => (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div 
                    className="px-3 py-2 rounded-lg text-white text-sm font-medium mb-2"
                    style={{ backgroundColor: component.color }}
                  >
                    {component.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {component.type}
                  </div>
                  {component.meaning && (
                    <div className="text-xs text-muted-foreground mt-1">
                      "{component.meaning}"
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EtymologyTimelineVisualization = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Etymology Timeline</h3>
        <Button size="sm" variant="outline" onClick={() => exportVisualization('svg')}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      <div className="relative h-64 border rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="relative h-full">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-amber-300"></div>
          {visualizationData.etymologyTimeline?.events?.map((event: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="absolute"
              style={{ 
                left: `${(index / (visualizationData.etymologyTimeline.events.length - 1)) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-center">
                <div className="w-4 h-4 bg-amber-500 rounded-full mb-2 mx-auto"></div>
                <div className="bg-white p-2 rounded-lg shadow-sm border min-w-24">
                  <div className="text-xs font-medium">{event.date}</div>
                  <div className="text-xs text-muted-foreground">{event.event}</div>
                  <div className="text-xs font-semibold">{event.form}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const SemanticNetworkVisualization = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Semantic Relationship Network</h3>
        <Button size="sm" variant="outline" onClick={() => exportVisualization('svg')}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      <div className="relative h-64 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            {/* Central word */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {word}
              </div>
            </div>
            
            {/* Related words in circle */}
            {visualizationData.semanticNetwork?.nodes?.slice(1, 7).map((node: any, index: number) => {
              const angle = (index * 60) * (Math.PI / 180);
              const radius = 80;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: node.color }}
                  >
                    {node.label}
                  </div>
                  <div className="text-xs text-center mt-1 text-muted-foreground">
                    {node.type}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const PhoneticPatternVisualization = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Phonetic Analysis</h3>
        <Button size="sm" variant="outline" onClick={() => exportVisualization('svg')}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      <div className="relative h-64 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="space-y-4">
          {visualizationData.phoneticPattern?.ipa && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">IPA Transcription</div>
              <div className="text-2xl font-mono bg-white p-3 rounded-lg border">
                /{visualizationData.phoneticPattern.ipa}/
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Syllable Structure</div>
              <div className="text-sm bg-white p-2 rounded border">
                {visualizationData.phoneticPattern?.syllableStructure || 'CVC'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Stress Pattern</div>
              <div className="text-sm bg-white p-2 rounded border">
                {visualizationData.phoneticPattern?.stressPattern || 'Primary'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Advanced Visualization System
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeVisualization} onValueChange={setActiveVisualization}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="morphology" className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Morphology
              </TabsTrigger>
              <TabsTrigger value="etymology" className="flex items-center gap-2">
                <Timeline className="h-4 w-4" />
                Etymology
              </TabsTrigger>
              <TabsTrigger value="semantic" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Semantic
              </TabsTrigger>
              <TabsTrigger value="phonetic" className="flex items-center gap-2">
                <Waveform className="h-4 w-4" />
                Phonetic
              </TabsTrigger>
            </TabsList>

            <TabsContent value="morphology" className="mt-6">
              <MorphologyTreeVisualization />
            </TabsContent>

            <TabsContent value="etymology" className="mt-6">
              <EtymologyTimelineVisualization />
            </TabsContent>

            <TabsContent value="semantic" className="mt-6">
              <SemanticNetworkVisualization />
            </TabsContent>

            <TabsContent value="phonetic" className="mt-6">
              <PhoneticPatternVisualization />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
