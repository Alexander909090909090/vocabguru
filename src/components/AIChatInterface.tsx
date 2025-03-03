
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ThumbsUp, ThumbsDown, MessageSquare, Zap, HelpCircle } from "lucide-react";
import { Word } from "@/data/words";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

interface AIChatInterfaceProps {
  currentWord?: Word;
}

export function AIChatInterface({ currentWord }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your VocabGuru Assistant. How can I help you understand this word better? You can ask about etymology, morphemes, usage, or definitions.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (currentWord) {
      generateSuggestedQuestions(currentWord);
    }
  }, [currentWord]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSuggestedQuestions = (word: Word) => {
    const questions = [
      `What does "${word.word}" mean?`,
      `How do I use "${word.word}" in a sentence?`,
      `Tell me about the etymology of "${word.word}"`,
      `Break down the morphemes in "${word.word}"`,
      `What are some synonyms for "${word.word}"?`,
    ];
    setSuggestedQuestions(questions);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let responseText = "";
      
      // Check if the message is asking about etymology or morphological breakdown
      const lowerCaseInput = inputValue.toLowerCase();
      if ((lowerCaseInput.includes("etymology") || 
           lowerCaseInput.includes("origin") || 
           lowerCaseInput.includes("history") || 
           lowerCaseInput.includes("derive")) && 
          currentWord) {
        responseText = `The word "${currentWord.word}" ${generateEtymologyResponse(currentWord)}`;
      } 
      else if ((lowerCaseInput.includes("morpheme") || 
           lowerCaseInput.includes("breakdown") || 
           lowerCaseInput.includes("analyze") || 
           lowerCaseInput.includes("analyse") ||
           lowerCaseInput.includes("root") ||
           lowerCaseInput.includes("prefix") ||
           lowerCaseInput.includes("suffix")) && 
          currentWord) {
        responseText = `Let's break down "${currentWord.word}" into its morphological components:\n\n${generateMorphemeBreakdownText(currentWord)}`;
      } 
      else if ((lowerCaseInput.includes("meaning") || 
                lowerCaseInput.includes("definition") ||
                lowerCaseInput.includes("define") ||
                lowerCaseInput.includes("what does") ||
                lowerCaseInput.includes("what is")) && 
               currentWord) {
        responseText = generateDefinitionResponse(currentWord);
      } 
      else if ((lowerCaseInput.includes("example") || 
                lowerCaseInput.includes("sentence") || 
                lowerCaseInput.includes("usage") ||
                lowerCaseInput.includes("use in a") ||
                lowerCaseInput.includes("how to use")) && 
               currentWord) {
        responseText = generateUsageResponse(currentWord);
      }
      else if ((lowerCaseInput.includes("synonym") || 
                lowerCaseInput.includes("similar") || 
                lowerCaseInput.includes("same as") ||
                lowerCaseInput.includes("like")) && 
               currentWord) {
        responseText = generateSynonymsResponse(currentWord);
      }
      else if ((lowerCaseInput.includes("antonym") || 
                lowerCaseInput.includes("opposite") || 
                lowerCaseInput.includes("contrary")) && 
               currentWord) {
        responseText = generateAntonymsResponse(currentWord);
      }
      else if ((lowerCaseInput.includes("form") || 
                lowerCaseInput.includes("noun") || 
                lowerCaseInput.includes("verb") ||
                lowerCaseInput.includes("adjective") ||
                lowerCaseInput.includes("adverb")) && 
               currentWord) {
        responseText = generateFormsResponse(currentWord);
      }
      else {
        responseText = currentWord
          ? `I'd be happy to help you learn more about "${currentWord.word}". You can ask me about:\n\n• Etymology and origin\n• Morphological breakdown\n• Definitions and meanings\n• Example sentences\n• Synonyms and antonyms\n• Different word forms\n\nWhat would you like to know?`
          : "I'm here to help with vocabulary questions. What would you like to learn about?";
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateEtymologyResponse = (word: Word): string => {
    let response = "";
    
    if (word.etymology.origin) {
      response += `comes from ${word.etymology.origin}`;
    }
    
    if (word.etymology.evolution) {
      response += response ? `\n\nHistorical evolution: ${word.etymology.evolution}` : `has evolved as follows: ${word.etymology.evolution}`;
    }
    
    if (word.etymology.culturalVariations) {
      response += `\n\nCultural variations: ${word.etymology.culturalVariations}`;
    }
    
    if (!response) {
      response = `I don't have detailed etymology information for "${word.word}", but it has ${word.languageOrigin} origins.`;
    }
    
    return response;
  };

  const generateMorphemeBreakdownText = (word: Word): string => {
    let text = "";
    
    if (word.morphemeBreakdown.prefix) {
      text += `• Prefix: ${word.morphemeBreakdown.prefix.text} - ${word.morphemeBreakdown.prefix.meaning}\n\n`;
    }
    
    text += `• Root Word: ${word.morphemeBreakdown.root.text} - ${word.morphemeBreakdown.root.meaning}\n\n`;
    
    if (word.morphemeBreakdown.suffix) {
      text += `• Suffix: ${word.morphemeBreakdown.suffix.text} - ${word.morphemeBreakdown.suffix.meaning}`;
    }
    
    // Add a summary
    text += `\n\nTherefore, "${word.word}" literally means `;
    
    let meaningParts = [];
    if (word.morphemeBreakdown.prefix) {
      meaningParts.push(word.morphemeBreakdown.prefix.meaning);
    }
    
    meaningParts.push(word.morphemeBreakdown.root.meaning);
    
    if (word.morphemeBreakdown.suffix) {
      meaningParts.push(word.morphemeBreakdown.suffix.meaning);
    }
    
    text += meaningParts.join(" + ") + ".";
    
    return text;
  };

  const generateDefinitionResponse = (word: Word): string => {
    if (!word.definitions || word.definitions.length === 0) {
      return `I don't have any definitions for "${word.word}".`;
    }
    
    let response = `"${word.word}" ${word.pronunciation ? `(${word.pronunciation})` : ""} is a ${word.partOfSpeech}.\n\n`;
    
    word.definitions.forEach((def, index) => {
      const defType = def.type.charAt(0).toUpperCase() + def.type.slice(1);
      response += `${index + 1}. ${defType} definition: ${def.text}\n\n`;
    });
    
    return response;
  };

  const generateUsageResponse = (word: Word): string => {
    let response = "";
    
    if (word.usage.exampleSentence) {
      response += `Here's an example of how to use "${word.word}" in a sentence:\n\n"${word.usage.exampleSentence}"\n\n`;
    }
    
    if (word.usage.commonCollocations && word.usage.commonCollocations.length > 0) {
      response += `Common phrases with "${word.word}":\n`;
      word.usage.commonCollocations.forEach((collocation, index) => {
        response += `• ${collocation}\n`;
      });
      response += "\n";
    }
    
    if (word.usage.contextualUsage) {
      response += `Contextual usage: ${word.usage.contextualUsage}\n\n`;
    }
    
    if (word.usage.sentenceStructure) {
      response += `Sentence structure: ${word.usage.sentenceStructure}`;
    }
    
    if (!response) {
      response = `I don't have specific usage examples for "${word.word}".`;
    }
    
    return response;
  };

  const generateSynonymsResponse = (word: Word): string => {
    if (!word.synonymsAntonyms.synonyms || word.synonymsAntonyms.synonyms.length === 0) {
      return `I don't have any synonyms listed for "${word.word}".`;
    }
    
    let response = `Here are some synonyms for "${word.word}":\n\n`;
    word.synonymsAntonyms.synonyms.forEach((synonym, index) => {
      response += `• ${synonym}\n`;
    });
    
    return response;
  };

  const generateAntonymsResponse = (word: Word): string => {
    if (!word.synonymsAntonyms.antonyms || word.synonymsAntonyms.antonyms.length === 0) {
      return `I don't have any antonyms listed for "${word.word}".`;
    }
    
    let response = `Here are some antonyms (opposites) for "${word.word}":\n\n`;
    word.synonymsAntonyms.antonyms.forEach((antonym, index) => {
      response += `• ${antonym}\n`;
    });
    
    return response;
  };

  const generateFormsResponse = (word: Word): string => {
    const { forms } = word;
    let response = `Word forms for "${word.word}":\n\n`;
    
    if (!forms.noun && !forms.verb && !forms.adjective && !forms.adverb) {
      return `I don't have any alternative word forms listed for "${word.word}".`;
    }
    
    if (forms.noun) response += `• Noun form: ${forms.noun}\n`;
    if (forms.verb) response += `• Verb form: ${forms.verb}\n`;
    if (forms.adjective) response += `• Adjective form: ${forms.adjective}\n`;
    if (forms.adverb) response += `• Adverb form: ${forms.adverb}\n`;
    
    return response;
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const newMessage = { ...message };
        
        if (type === 'like') {
          newMessage.liked = !message.liked;
          if (newMessage.liked && message.disliked) {
            newMessage.disliked = false;
          }
          if (newMessage.liked) {
            toast.success("Thank you for your feedback!");
          }
        } else {
          newMessage.disliked = !message.disliked;
          if (newMessage.disliked && message.liked) {
            newMessage.liked = false;
          }
          if (newMessage.disliked) {
            toast.success("Thank you for your feedback!");
          }
        }
        
        return newMessage;
      }
      return message;
    }));
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="flex flex-col h-[500px] border border-white/10 rounded-lg overflow-hidden bg-background">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-medium">VocabGuru Assistant</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">
              Ask me anything about this word! I can explain etymology, usage, definitions, and more.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`flex flex-col ${
              message.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.sender === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-card/90 backdrop-blur-sm border border-white/10"
            }`}>
              <div className="whitespace-pre-line">{message.text}</div>
            </div>
            
            {message.sender === "ai" && message.id !== "welcome" && (
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ${message.liked ? 'text-primary' : ''}`}
                  onClick={() => handleFeedback(message.id, 'like')}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ${message.disliked ? 'text-primary' : ''}`}
                  onClick={() => handleFeedback(message.id, 'dislike')}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            )}
            
            {message.sender === "user" && (
              <span className="text-xs text-muted-foreground mt-1">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-card/90 backdrop-blur-sm border border-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-white/10 flex items-center overflow-x-auto gap-2 no-scrollbar">
          <Zap className="h-4 w-4 text-primary flex-shrink-0" />
          {suggestedQuestions.map((question, index) => (
            <Button 
              key={index}
              variant="ghost" 
              size="sm" 
              className="text-xs whitespace-nowrap flex-shrink-0 h-7"
              onClick={() => handleQuickQuestion(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this word..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AIChatInterface;
