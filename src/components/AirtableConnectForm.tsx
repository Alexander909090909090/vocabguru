
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  initAirtable, 
  isAirtableConnected, 
  disconnectAirtable, 
  testAirtableConnection, 
  getAirtableSchema 
} from "@/services/airtableService";
import { toast } from "sonner";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";

interface AirtableConnectFormProps {
  onConnect: () => void;
}

export function AirtableConnectForm({ onConnect }: AirtableConnectFormProps) {
  const [personalAccessToken, setPersonalAccessToken] = useState("");
  const [baseId, setBaseId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(isAirtableConnected());
  const schema = getAirtableSchema();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalAccessToken || !baseId) {
      toast.error("Please provide both Personal Access Token and Base ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First test the connection
      const isValid = await testAirtableConnection(personalAccessToken, baseId);
      
      if (!isValid) {
        throw new Error("Unable to connect to Airtable. Please check your credentials and ensure your base has a 'Words' table.");
      }
      
      // If connection test is successful, initialize Airtable
      initAirtable(personalAccessToken, baseId);
      
      toast.success("Successfully connected to Airtable!");
      setIsConnected(true);
      onConnect();
    } catch (error) {
      console.error("Error connecting to Airtable:", error);
      disconnectAirtable(); // Clean up failed connection
      toast.error(error instanceof Error ? error.message : "Failed to connect to Airtable. Please try again.");
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
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-center flex items-center justify-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
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
            <p className="text-xs text-muted-foreground">
              Your token should start with "pat". Find or create one in your Airtable account settings.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="baseId">
              Airtable Base ID
            </label>
            <Input
              id="baseId"
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              placeholder="app..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Your Base ID should start with "app". Find it in the API documentation for your base.
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect to Airtable"}
          </Button>
        </form>
      )}
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="schema">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              Airtable Schema Information
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-sm space-y-3">
              <p>Your Airtable base should have a table named <span className="font-bold">{schema.tableName}</span> with the following structure:</p>
              
              <div className="space-y-2">
                <p className="font-medium">Required Fields:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {schema.requiredFields.map(field => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Recommended Fields:</p>
                <div className="bg-muted p-2 rounded-md max-h-48 overflow-y-auto">
                  <ul className="list-disc pl-5 space-y-1">
                    {schema.recommendedFields.map(field => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md flex gap-2">
                <AlertTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-amber-800 dark:text-amber-300 text-xs">
                  Make sure your Airtable personal token has appropriate permissions to read from this table.
                  If you're having connection issues, check the console for detailed error messages.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="text-sm text-muted-foreground">
        <p>
          Don't have Airtable set up yet? <a href="https://airtable.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sign up for free</a> and create a Words table with fields matching your vocabulary structure.
        </p>
      </div>
    </div>
  );
}

export default AirtableConnectForm;
