import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Search, Trophy } from "lucide-react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedWordCard } from "@/components/Feed/FeedWordCard";
import { useWordFeed, type FeedFilter, type FeedSort } from "@/hooks/useWordFeed";

type Layout = "grid" | "list";

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "prefix", label: "Has prefix" },
  { value: "suffix", label: "Has suffix" },
];
const SORTS: { value: FeedSort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
  { value: "alpha", label: "A–Z" },
];

// Per-viewer preference, safe when storage is unavailable.
function usePersisted<T extends string>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      return (localStorage.getItem(key) as T) || fallback;
    } catch {
      return fallback;
    }
  });
  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* ignore */
    }
  };
  return [value, set];
}

const Index = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [sort, setSort] = usePersisted<FeedSort>("vocabguru-feed-sort", "recent");
  const [layout, setLayout] = usePersisted<Layout>("vocabguru-feed-layout", "grid");
  const [username] = usePersisted<string>("vocabguru-username", "Scholar");
  const feed = useWordFeed(sort, filter);
  const words = feed.data?.pages.flatMap((p) => p.words) ?? [];
  const total = feed.data?.pages[0]?.count;

  // Infinite scroll: load the next page when the sentinel comes into view.
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = feed;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && !isFetchingNextPage && fetchNextPage(), {
      rootMargin: "400px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Every search goes to Calvern, which returns the stored breakdown or creates it.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const word = query.trim().toLowerCase();
    if (!word) return;
    navigate(`/w/${encodeURIComponent(word)}`);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="page-container pt-24 pb-16">
        <section className="glass-card mb-8 space-y-5 rounded-2xl p-8 text-center md:p-12">
          <h1 className="text-3xl font-bold md:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">{username}!</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Search a word and Calvern breaks it into prefix, root and suffix, traces its history, and saves the profile.
          </p>
          <form className="relative mx-auto w-full max-w-md" onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="Search any word…"
              aria-label="Search any word"
              className="h-12 w-full border-none bg-secondary/50 pl-12 focus-visible:ring-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </form>
          {total !== undefined && <p className="text-sm text-muted-foreground">{total} word profiles</p>}
        </section>

        <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                className="rounded-full"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-border p-0.5">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value)}
                  className={`rounded-full px-3 py-1 text-sm ${sort === s.value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button
              size="icon"
              variant="secondary"
              aria-label={layout === "grid" ? "Show as list" : "Show as grid"}
              onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
            >
              {layout === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button className="gap-2" variant="quiz" onClick={() => navigate("/quiz")}>
              <Trophy className="h-4 w-4" /> Quiz
            </Button>
          </div>
        </section>

        {feed.isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : feed.isError ? (
          <div className="glass-card space-y-3 rounded-xl p-8 text-center">
            <p>Couldn't load words.</p>
            <Button variant="outline" size="sm" onClick={() => feed.refetch()}>
              Try again
            </Button>
          </div>
        ) : words.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            No words yet. Search one above to create its profile.
          </div>
        ) : (
          <div className={layout === "grid" ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
            {words.map((w) => (
              <FeedWordCard key={w.id} word={w} layout={layout} />
            ))}
          </div>
        )}

        <div ref={sentinel} className="h-8" />
        {feed.isFetchingNextPage && <p className="text-center text-sm text-muted-foreground">Loading more…</p>}
      </main>
    </div>
  );
};

export default Index;
