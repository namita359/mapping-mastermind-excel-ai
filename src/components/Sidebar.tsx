
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
import { Database, Search, Upload, Download, Check, Edit, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  onUploadClick: () => void;
  onDownloadClick: () => void;
}

export function AppSidebar({ onUploadClick, onDownloadClick }: SidebarProps) {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Database,
      active: location.pathname === "/"
    },
    {
      title: "Mappings",
      url: "/mapping",
      icon: FileText,
      active: location.pathname === "/mapping"
    }
  ];
  
  const actionItems = [
    {
      title: "Upload",
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={item.active ? "bg-sidebar-accent" : ""}>
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
