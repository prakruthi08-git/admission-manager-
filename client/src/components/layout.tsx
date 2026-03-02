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
  SidebarTrigger,
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
    <Sidebar className="border-r border-border/40 bg-gradient-to-b from-background to-muted/20">
      <SidebarContent className="pt-8">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-primary/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EduCore</h2>
            <p className="text-xs text-muted-foreground">Admission CRM</p>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3 px-6">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-2">
              {navItems.filter(i => i.visible).map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        rounded-xl transition-all duration-300 py-3 group relative overflow-hidden
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-lg shadow-primary/30 scale-[1.02]' 
                          : 'text-foreground hover:bg-accent/50 hover:text-foreground hover:scale-[1.01] hover:shadow-md'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-4">
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-primary/10'}`}>
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <span className="font-medium">{item.title}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
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
    <header className="h-16 border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/50 text-foreground hover:bg-accent hover:border-primary/30 transition-all" />
        <h1 className="text-lg font-bold text-foreground">
          Admission Management
        </h1>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{role}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all relative group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-accent transition-all focus:outline-none border border-transparent hover:border-border/50">
            <Avatar className="w-8 h-8 ring-2 ring-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm">
                {role.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold leading-none">{role}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Switch role</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-border/50">
            <DropdownMenuLabel className="font-semibold">Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((r) => (
              <DropdownMenuItem 
                key={r} 
                onClick={() => setRole(r)}
                className={`cursor-pointer rounded-lg mb-1 transition-all ${role === r ? 'bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary font-semibold border border-primary/20' : 'hover:bg-accent'}`}
              >
                {r}
                {role === r && <ShieldCheck className="w-4 h-4 ml-auto text-primary" />}
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
