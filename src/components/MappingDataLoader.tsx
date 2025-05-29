// This component is no longer needed since we're loading data directly from Supabase
// in the useSupabaseMapping hook. We'll keep it as a placeholder for backward compatibility
// but it doesn't perform any loading operations anymore.

interface MappingDataLoaderProps {
  onLoadingChange: (loading: boolean) => void;
}

const MappingDataLoader = ({ onLoadingChange }: MappingDataLoaderProps) => {
  // Data loading is now handled by useSupabaseMapping hook
  // This component is kept for backward compatibility but does nothing
  return null;
};

export default MappingDataLoader;
