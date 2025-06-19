
import Header from "@/components/Header";
import { WordRepositoryGrid } from "@/components/WordRepository/WordRepositoryGrid";

const WordRepository = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="page-container pt-24 page-transition">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Word Repository</h1>
          <p className="text-muted-foreground text-lg">
            Explore our comprehensive collection of words with detailed etymological analysis, 
            morpheme breakdowns, and usage examples.
          </p>
        </div>
        
        <WordRepositoryGrid />
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WordRepository;
