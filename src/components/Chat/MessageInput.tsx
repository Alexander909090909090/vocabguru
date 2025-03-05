
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  isLoading: boolean;
}

const MessageInput = ({ 
  inputValue, 
  setInputValue, 
  handleSendMessage, 
  isLoading 
}: MessageInputProps) => {
  return (
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
  );
};

export default MessageInput;
