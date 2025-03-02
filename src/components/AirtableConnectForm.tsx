
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initAirtable, isAirtableConnected } from "@/services/airtableService";
import { toast } from "sonner";

interface AirtableConnectFormProps {
  onConnect: () => void;
}

export function AirtableConnectForm({ onConnect }: AirtableConnectFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [baseId, setBaseId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !baseId) {
      toast.error("Please provide both API Key and Base ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      initAirtable(apiKey, baseId);
      toast.success("Successfully connected to Airtable!");
      onConnect();
    } catch (error) {
      console.error("Error connecting to Airtable:", error);
      toast.error("Failed to connect to Airtable. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-md mx-auto bg-card rounded-lg border shadow-sm">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Connect to Airtable</h2>
        <p className="text-muted-foreground">
          Enter your Airtable API Key and Base ID to sync your vocabulary words.
        </p>
      </div>
      
      <form onSubmit={handleConnect} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="apiKey">
            Airtable API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="key123abc..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="baseId">
            Airtable Base ID
          </label>
          <Input
            id="baseId"
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
            placeholder="app123abc..."
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connecting..." : "Connect to Airtable"}
        </Button>
      </form>
      
      <div className="text-sm text-muted-foreground">
        <p>
          Don't have Airtable set up yet? <a href="https://airtable.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sign up for free</a> and create a Words table with fields matching your vocabulary structure.
        </p>
      </div>
    </div>
  );
}

export default AirtableConnectForm;
