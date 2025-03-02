
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initAirtable, isAirtableConnected, disconnectAirtable } from "@/services/airtableService";
import { toast } from "sonner";

interface AirtableConnectFormProps {
  onConnect: () => void;
}

export function AirtableConnectForm({ onConnect }: AirtableConnectFormProps) {
  const [personalAccessToken, setPersonalAccessToken] = useState("");
  const [baseId, setBaseId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(isAirtableConnected());

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalAccessToken || !baseId) {
      toast.error("Please provide both Personal Access Token and Base ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      initAirtable(personalAccessToken, baseId);
      
      // Test the connection by trying to fetch data
      await fetch(`https://api.airtable.com/v0/${baseId}/Words?maxRecords=1`, {
        headers: {
          Authorization: `Bearer ${personalAccessToken}`
        }
      }).then(response => {
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
      });
      
      toast.success("Successfully connected to Airtable!");
      setIsConnected(true);
      onConnect();
    } catch (error) {
      console.error("Error connecting to Airtable:", error);
      disconnectAirtable(); // Clean up failed connection
      toast.error("Failed to connect to Airtable. Please check your credentials and ensure your base has a 'Words' table.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectAirtable();
    setIsConnected(false);
    toast.success("Disconnected from Airtable");
  };

  return (
    <div className="space-y-6 p-6 max-w-md mx-auto bg-card rounded-lg border shadow-sm">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Connect to Airtable</h2>
        <p className="text-muted-foreground">
          Enter your Airtable Personal Access Token and Base ID to sync your vocabulary words.
        </p>
      </div>
      
      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-center">
            <p className="text-green-800 dark:text-green-300">Connected to Airtable</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDisconnect}
          >
            Disconnect from Airtable
          </Button>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="personalAccessToken">
              Airtable Personal Access Token
            </label>
            <Input
              id="personalAccessToken"
              type="password"
              value={personalAccessToken}
              onChange={(e) => setPersonalAccessToken(e.target.value)}
              placeholder="pat..."
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
      )}
      
      <div className="text-sm text-muted-foreground">
        <p>
          Don't have Airtable set up yet? <a href="https://airtable.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sign up for free</a> and create a Words table with fields matching your vocabulary structure.
        </p>
      </div>
    </div>
  );
}

export default AirtableConnectForm;
