
import { RefObject } from "react";
import { Message } from "@/types/chat";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  handleFeedback: (messageId: string, type: 'like' | 'dislike') => void;
  formatTimestamp: (date: Date) => string;
}

const MessageList = ({ 
  messages, 
  isLoading, 
  messagesEndRef, 
  handleFeedback, 
  formatTimestamp 
}: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <MessageItem 
          key={message.id} 
          message={message} 
          handleFeedback={handleFeedback} 
          formatTimestamp={formatTimestamp} 
        />
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
  );
};

export default MessageList;
