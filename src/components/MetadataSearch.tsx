
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight } from 'lucide-react';
import { metadataService, MetadataSearchResult } from '@/lib/metadataService';
import { useToast } from '@/hooks/use-toast';

interface MetadataSearchProps {
  onSelectMetadata: (metadata: MetadataSearchResult) => void;
  placeholder?: string;
  className?: string;
}

const MetadataSearch = ({ onSelectMetadata, placeholder = "Search business metadata...", className }: MetadataSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MetadataSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await metadataService.searchMetadata(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try searching with different terms",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: MetadataSearchResult) => {
    onSelectMetadata(result);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchTerm.trim()}
          size="sm"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSelectResult(result)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {result.malcode}
                      </Badge>
                      <span className="text-sm font-medium">
                        {result.table_name}.{result.column_name}
                      </span>
                      {result.data_type && (
                        <Badge variant="secondary" className="text-xs">
                          {result.data_type}
                        </Badge>
                      )}
                    </div>
                    {result.business_description && (
                      <p className="text-sm text-muted-foreground">
                        {result.business_description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetadataSearch;
