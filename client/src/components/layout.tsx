import React from "react";
import { Link, useLocation } from "wouter";
import { useRole, type Role } from "@/lib/role-context";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  GraduationCap,
  Bell,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function AppSidebar() {
  const [location] = useLocation();
  const { canManageSetup, canManageAdmissions } = useRole();

  const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, visible: true },
    { title: "Master Setup", url: "/setup", icon: Settings, visible: canManageSetup },
    { title: "Applicants", url: "/applicants", icon: Users, visible: canManageAdmissions },
    { title: "Admissions", url: "/admissions", icon: GraduationCap, visible: canManageAdmissions },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border shadow-2xl shadow-black/5">
      <SidebarContent className="pt-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold text-gradient">EduCore CRM</h2>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2 px-6">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1">
              {navItems.filter(i => i.visible).map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        rounded-xl transition-all duration-200 py-3
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function TopNav() {
  const { role, setRole } = useRole();
  const roles: Role[] = ["Admin", "Admission Officer", "Management"];

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground font-display">
          Admission Management
        </h1>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          {role} Mode
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
            <Avatar className="w-9 h-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {role.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">{role} User</p>
              <p className="text-xs text-muted-foreground mt-0.5">Change Role</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
            <DropdownMenuLabel>Simulate Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((r) => (
              <DropdownMenuItem 
                key={r} 
                onClick={() => setRole(r)}
                className={`cursor-pointer rounded-lg mb-1 ${role === r ? 'bg-primary/10 text-primary font-medium' : ''}`}
              >
                {r}
                {role === r && <ShieldCheck className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "18rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-slate-50/50 dark:bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
          <TopNav />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
