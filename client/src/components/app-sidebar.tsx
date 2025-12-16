import { useLocation, Link } from "wouter";
import {
  Home,
  Mic,
  Music,
  Trophy,
  Settings,
  Target,
  Sparkles,
  Star,
  Lock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ProgressRing } from "./progress-ring";
import type { User } from "@shared/schema";

interface AppSidebarProps {
  user: User | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();

  const phaseProgress = user
    ? {
        1: user.currentPhase > 1 ? 100 : user.currentWeek <= 4 ? (user.currentWeek / 4) * 100 : 0,
        2: user.currentPhase > 2 ? 100 : user.currentPhase === 2 ? ((user.currentWeek - 4) / 4) * 100 : 0,
        3: user.currentPhase === 3 ? ((user.currentWeek - 8) / 4) * 100 : 0,
      }
    : { 1: 0, 2: 0, 3: 0 };

  const mainNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Practice", url: "/practice", icon: Mic },
  ];

  const phases = [
    {
      id: 1,
      title: "Foundation",
      url: "/phase/1",
      icon: Target,
      unlocked: true,
    },
    {
      id: 2,
      title: "Technique & Expression",
      url: "/phase/2",
      icon: Sparkles,
      unlocked: (user?.currentPhase ?? 1) >= 2,
    },
    {
      id: 3,
      title: "Performance",
      url: "/phase/3",
      icon: Star,
      unlocked: (user?.currentPhase ?? 1) >= 3,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Mic className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">SingSmart AI</h1>
            <p className="text-xs text-muted-foreground">Your singing coach</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Learning Phases</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phases.map((phase) => (
                <SidebarMenuItem key={phase.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === phase.url}
                    disabled={!phase.unlocked}
                    data-testid={`nav-phase-${phase.id}`}
                  >
                    <Link
                      href={phase.unlocked ? phase.url : "#"}
                      className={!phase.unlocked ? "cursor-not-allowed" : ""}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {phase.unlocked ? (
                          <phase.icon className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={!phase.unlocked ? "text-muted-foreground" : ""}>
                          {phase.title}
                        </span>
                      </div>
                      {phase.unlocked && (
                        <ProgressRing
                          progress={phaseProgress[phase.id as keyof typeof phaseProgress]}
                          size={24}
                          strokeWidth={3}
                          showLabel={false}
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Performance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/songs"}
                  disabled={(user?.currentPhase ?? 1) < 2}
                  data-testid="nav-songs"
                >
                  <Link
                    href={(user?.currentPhase ?? 1) >= 2 ? "/songs" : "#"}
                    className={(user?.currentPhase ?? 1) < 2 ? "cursor-not-allowed" : ""}
                  >
                    {(user?.currentPhase ?? 1) >= 2 ? (
                      <Music className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={(user?.currentPhase ?? 1) < 2 ? "text-muted-foreground" : ""}>
                      Song Library
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/perform"}
                  disabled={(user?.currentPhase ?? 1) < 3}
                  data-testid="nav-perform"
                >
                  <Link
                    href={(user?.currentPhase ?? 1) >= 3 ? "/perform" : "#"}
                    className={(user?.currentPhase ?? 1) < 3 ? "cursor-not-allowed" : ""}
                  >
                    {(user?.currentPhase ?? 1) >= 3 ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={(user?.currentPhase ?? 1) < 3 ? "text-muted-foreground" : ""}>
                      Virtual Stage
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.experienceLevel}
              </p>
            </div>
            <Link href="/settings">
              <Settings className="h-4 w-4 text-muted-foreground hover-elevate" />
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
