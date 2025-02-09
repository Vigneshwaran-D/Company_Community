import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
