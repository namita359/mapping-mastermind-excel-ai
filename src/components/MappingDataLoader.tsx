// This component is no longer needed since we're loading data directly from the Azure SQL
// single table structure (mapping_single and metadata_single) in the useAzureSqlMapping hook. 
// We'll keep it as a placeholder for backward compatibility but it doesn't perform any loading operations anymore.

interface MappingDataLoaderProps {
  onLoadingChange: (loading: boolean) => void;
}

const MappingDataLoader = ({ onLoadingChange }: MappingDataLoaderProps) => {
  // Data loading is now handled by useAzureSqlMapping hook using single table structure
  // This component is kept for backward compatibility but does nothing
  return null;
};

export default MappingDataLoader;
