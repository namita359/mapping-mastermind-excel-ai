
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { FileText, Upload, Download, Check, Edit, Search, FileDown } from "lucide-react";

interface SidebarProps {
  onUploadClick: () => void;
  onDownloadClick: () => void;
}

export function AppSidebar({ onUploadClick, onDownloadClick }: SidebarProps) {
  const actionItems = [
    {
      title: "Upload Mapping",
      icon: Upload,
      onClick: onUploadClick,
      disabled: false
    },
    {
      title: "Download",
      icon: Download,
      onClick: onDownloadClick,
      disabled: false
    },
    {
      title: "Download Template",
      icon: FileDown,
      onClick: () => {
        window.open('/sample_mapping_template.csv', '_blank');
      },
      disabled: false
    },
    {
      title: "Search",
      icon: Search,
      onClick: () => {},
      disabled: true
    },
    {
      title: "Review",
      icon: Check,
      onClick: () => {},
      disabled: true
    },
    {
      title: "Edit",
      icon: Edit,
      onClick: () => {},
      disabled: true
    }
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Data Mapping Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="bg-sidebar-accent">
                  <FileText className="h-5 w-5" />
                  <span>Mapping Tool</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick} disabled={item.disabled}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
