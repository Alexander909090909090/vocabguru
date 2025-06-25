
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

const WordNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container pt-24">
        <div className="glass-card rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Word Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The word you're looking for doesn't exist in our database.
          </p>
          <Button onClick={() => navigate("/")}>
            Return to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WordNotFound;
