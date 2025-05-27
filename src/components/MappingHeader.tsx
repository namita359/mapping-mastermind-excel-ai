
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DownloadButton from "@/components/DownloadButton";
import SearchBar from "@/components/SearchBar";
import { MappingFile } from "@/lib/types";
import { Upload, Download, Plus, Sparkles, Menu, Info } from "lucide-react";

interface MappingHeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  hasData: boolean;
  mappingFile: MappingFile;
  onUploadClick: () => void;
  onAddMappingClick: () => void;
  onAIAssistantToggle: () => void;
  showAIAssistant: boolean;
  onSearch: (query: string, filters: Record<string, string>) => void;
  onAISearch: (query: string) => void;
  searchLoading: boolean;
}

const MappingHeader = ({
  showSidebar,
  setShowSidebar,
  hasData,
  mappingFile,
  onUploadClick,
  onAddMappingClick,
  onAIAssistantToggle,
  showAIAssistant,
  onSearch,
  onAISearch,
  searchLoading
}: MappingHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b flex-shrink-0">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Data Mapping Hub</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
                Mappings
              </Button>
              <Button variant="ghost" size="sm">
                Lineage
              </Button>
              <Button variant="ghost" size="sm">
                Governance
              </Button>
            </nav>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAIAssistantToggle}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              AI Assistant
            </Button>
            
            {hasData && (
              <DownloadButton mappingFile={mappingFile}>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </DownloadButton>
            )}
            
            <Button onClick={onAddMappingClick} size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-1 h-4 w-4" /> Add Mapping
            </Button>
            
            <Button onClick={onUploadClick} size="sm">
              <Upload className="mr-1 h-4 w-4" /> Upload
            </Button>
          </div>
        </div>

        {/* Subtitle and context */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">SRZ (Raw Zone)</span> → <span className="font-medium">CZ/Synapse (Target)</span>
            </p>
            <Badge variant="outline" className="text-xs">
              <Info className="mr-1 h-3 w-3" />
              {mappingFile.rows.length} Total Mappings
            </Badge>
          </div>
        </div>

        {/* Search Bar */}
        {hasData && (
          <div className="mt-4">
            <SearchBar 
              onSearch={onSearch} 
              onAISearch={onAISearch}
              loading={searchLoading} 
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default MappingHeader;
