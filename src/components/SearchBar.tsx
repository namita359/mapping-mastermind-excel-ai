
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
  onAISearch: (query: string) => void;
  loading?: boolean;
}

const SearchBar = ({ onSearch, onAISearch, loading = false }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    sourceSystem: "",
    targetSystem: "",
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleAISearch = () => {
    onAISearch(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search mappings..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>Search</Button>
        <Button 
          variant="outline" 
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Advanced
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleAISearch}
          disabled={loading || !query.trim()}
        >
          AI Search
        </Button>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-md">
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-sm font-medium">Status</span>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-sm font-medium">Source System</span>
            <Select 
              value={filters.sourceSystem} 
              onValueChange={(value) => handleFilterChange("sourceSystem", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any source</SelectItem>
                <SelectItem value="crm">CRM System</SelectItem>
                <SelectItem value="erp">ERP System</SelectItem>
                <SelectItem value="legacy">Legacy System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-sm font-medium">Target System</span>
            <Select 
              value={filters.targetSystem} 
              onValueChange={(value) => handleFilterChange("targetSystem", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any target</SelectItem>
                <SelectItem value="warehouse">Data Warehouse</SelectItem>
                <SelectItem value="lake">Data Lake</SelectItem>
                <SelectItem value="mart">Data Mart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {Object.entries(filters).some(([_, value]) => value) && (
            <div className="flex flex-wrap gap-1 items-center mt-2 w-full">
              <span className="text-sm font-medium">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => 
                value ? (
                  <Badge 
                    key={key} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {key}: {value}
                    <button 
                      className="ml-1 text-xs" 
                      onClick={() => handleFilterChange(key, "")}
                    >
                      ×
                    </button>
                  </Badge>
                ) : null
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
