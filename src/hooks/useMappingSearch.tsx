
import { MappingRow } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseMappingContext } from '@/components/SupabaseMappingProvider';

export const useMappingSearch = () => {
  const { 
    mappingFile, 
    searchResults, 
    setSearchResults, 
    searchLoading, 
    setSearchLoading,
    statusFilter 
  } = useSupabaseMappingContext();
  const { toast } = useToast();

  const handleSearch = (query: string, filters: Record<string, string>) => {
    setSearchLoading(true);
    
    setTimeout(() => {
      let results = [...mappingFile.rows];
      
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(row => 
          row.sourceColumn.malcode.toLowerCase().includes(lowerQuery) ||
          row.sourceColumn.table.toLowerCase().includes(lowerQuery) ||
          row.sourceColumn.column.toLowerCase().includes(lowerQuery) ||
          row.targetColumn.malcode.toLowerCase().includes(lowerQuery) ||
          row.targetColumn.table.toLowerCase().includes(lowerQuery) ||
          row.targetColumn.column.toLowerCase().includes(lowerQuery) ||
          (row.transformation && row.transformation.toLowerCase().includes(lowerQuery))
        );
      }
      
      if (filters.status) {
        results = results.filter(row => row.status === filters.status);
      }
      
      setSearchResults(results);
      setSearchLoading(false);
      
      toast({
        title: "Search complete",
        description: `Found ${results.length} mapping rows`,
      });
    }, 500);
  };

  const handleAISearch = (query: string) => {
    setSearchLoading(true);
    
    setTimeout(() => {
      const results = mappingFile.rows.filter(row => {
        if (query.toLowerCase().includes("transformation") || query.toLowerCase().includes("transform")) {
          return row.transformation !== undefined;
        }
        if (query.toLowerCase().includes("direct") || query.toLowerCase().includes("copy")) {
          return row.transformation === undefined;
        }
        
        return (
          row.sourceColumn.malcode.toLowerCase().includes(query.toLowerCase()) ||
          row.sourceColumn.table.toLowerCase().includes(query.toLowerCase()) ||
          row.sourceColumn.column.toLowerCase().includes(query.toLowerCase()) ||
          row.targetColumn.malcode.toLowerCase().includes(query.toLowerCase()) ||
          row.targetColumn.table.toLowerCase().includes(query.toLowerCase()) ||
          row.targetColumn.column.toLowerCase().includes(query.toLowerCase()) ||
          (row.transformation && row.transformation.toLowerCase().includes(query.toLowerCase()))
        );
      });
      
      setSearchResults(results);
      setSearchLoading(false);
      
      toast({
        title: "AI search complete",
        description: `Found ${results.length} mapping rows based on your query`,
      });
    }, 1000);
  };

  const getFilteredRows = () => {
    let rowsToFilter = searchResults !== null ? searchResults : mappingFile.rows;
    
    if (statusFilter) {
      return rowsToFilter.filter(row => row.status === statusFilter);
    }
    
    return rowsToFilter;
  };

  return {
    searchLoading,
    handleSearch,
    handleAISearch,
    getFilteredRows,
  };
};
