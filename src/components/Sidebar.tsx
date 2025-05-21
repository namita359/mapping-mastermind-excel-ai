
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { FileUp, Download, GitBranch } from "lucide-react";

interface AppSidebarProps {
  onUploadClick?: () => void;
  onDownloadClick?: () => void;
}

export function AppSidebar({ onUploadClick, onDownloadClick }: AppSidebarProps) {
  const sidebar = useSidebar();
  const collapsed = sidebar?.collapsed || false;
  const { toast } = useToast();

  return (
    <div className={`h-screen border-r bg-muted/40 ${collapsed ? "w-[60px]" : "w-[220px]"} flex flex-col p-2`}>
      <div className="flex flex-col gap-1">
        <Link to="/" className="w-full">
          <Button variant="ghost" className="w-full justify-start">
            <FileUp className="h-5 w-5 mr-2" />
            <span className={`${collapsed ? "hidden" : "inline"}`}>Mapping</span>
          </Button>
        </Link>
        
        <Link to="/lineage" className="w-full">
          <Button variant="ghost" className="w-full justify-start">
            <GitBranch className="h-5 w-5 mr-2" />
            <span className={`${collapsed ? "hidden" : "inline"}`}>Lineage</span>
          </Button>
        </Link>

        {onUploadClick && (
          <Button variant="ghost" className="w-full justify-start" onClick={onUploadClick}>
            <FileUp className="h-5 w-5 mr-2" />
            <span className={`${collapsed ? "hidden" : "inline"}`}>Upload</span>
          </Button>
        )}
        
        {onDownloadClick && (
          <Button variant="ghost" className="w-full justify-start" onClick={onDownloadClick}>
            <Download className="h-5 w-5 mr-2" />
            <span className={`${collapsed ? "hidden" : "inline"}`}>Download</span>
          </Button>
        )}
      </div>
    </div>
  );
}
