
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { FileUp, GitBranch, Home, Download } from "lucide-react";

interface AppSidebarProps {
  onUploadClick: () => void;
  onDownloadClick?: () => void;
}

export function AppSidebar({ onUploadClick, onDownloadClick }: AppSidebarProps) {
  const sidebar = useSidebar();
  const collapsed = sidebar ? sidebar.state === "collapsed" : false;
  const { toast } = useToast();

  return (
    <div className={`h-screen border-r bg-muted/40 ${collapsed ? "w-[60px]" : "w-[200px]"} flex flex-col p-2 flex-shrink-0`}>
      <div className="mb-4 flex items-center justify-center">
        <Link to="/" className="flex items-center">
          <FileUp className="h-5 w-5 text-primary" />
          {!collapsed && <span className="ml-2 text-sm font-semibold">Data Mapper</span>}
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            size={collapsed ? "icon" : "default"}
          >
            <Home className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Mapping</span>}
          </Button>
        </Link>
        <Link to="/lineage">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            size={collapsed ? "icon" : "default"}
          >
            <GitBranch className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Lineage</span>}
          </Button>
        </Link>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button 
          variant="outline"
          className="w-full justify-start" 
          size={collapsed ? "icon" : "default"}
          onClick={onUploadClick}
        >
          <FileUp className="h-4 w-4" />
          {!collapsed && <span className="ml-2 text-sm">Upload</span>}
        </Button>
        {onDownloadClick && (
          <Button 
            variant="outline"
            className="w-full justify-start" 
            size={collapsed ? "icon" : "default"}
            onClick={onDownloadClick}
          >
            <Download className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Download</span>}
          </Button>
        )}
      </div>
    </div>
  );
}
