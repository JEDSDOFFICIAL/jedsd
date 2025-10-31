"use client";

import * as React from "react";
import { ChevronsUpDown, GraduationCap, ShieldUser, UserCheck, FileEdit, RefreshCw } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { User, UserType } from "@prisma/client";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const iconMap: Record<UserType, React.ElementType> = {
  ADMIN: ShieldUser,
  AUTHOR: GraduationCap,
  REVIEWER: UserCheck,
  EDITOR: FileEdit,
};

const roleLabels: Record<UserType, string> = {
  ADMIN: "Admin",
  AUTHOR: "Author",
  REVIEWER: "Reviewer",
  EDITOR: "Editor",
};

// Role switching rules
const ROLE_RULES: Record<UserType, UserType[]> = {
  ADMIN: ["ADMIN", "AUTHOR", "REVIEWER", "EDITOR"],
  EDITOR: ["EDITOR", "AUTHOR", "REVIEWER"],
  REVIEWER: ["REVIEWER", "AUTHOR"],
  AUTHOR: ["AUTHOR"],
};

interface UserTypeSwitcherProps {
  user: User;
}

export function UserTypeSwitcher({ user }: UserTypeSwitcherProps) {
  const { isMobile } = useSidebar();
  const [currentRole, setCurrentRole] = React.useState<UserType>(user.variableUserType || user.userType);
  const [isSwitching, setIsSwitching] = React.useState(false);

  // Compute available roles locally
  const availableRoles: UserType[] = React.useMemo(() => {
    let roles = ROLE_RULES[user.userType] || [];
    // allow switching back to original if currently switched
    if (currentRole !== user.userType && !roles.includes(user.userType)) {
      roles = [...roles, user.userType];
    }
    // remove the currently active role
    return roles.filter((r) => r !== currentRole);
  }, [user.userType, currentRole]);
  const router = useRouter();
  const handleRoleSwitch = async (newRole: UserType) => {
    try {
      setIsSwitching(true);
      const res = await axios.post("/api/user/switchRole", {
        newRole,
      });
      const data = res.data;
      if (data.success) {
        toast.success(`Switched to ${roleLabels[newRole]}`);
        setCurrentRole(newRole);
        window.dispatchEvent(
          new CustomEvent("userRoleChanged", { detail: { newRole, oldRole: currentRole } })
        );
      } else {
        toast.error(data.message || "Failed to switch role");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setIsSwitching(false);
      const targetRole = newRole.toLowerCase();
      router.push(`/dashboard/${targetRole}`);
    }
  };

  const CurrentIcon = iconMap[currentRole];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isSwitching}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                <CurrentIcon className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">
                  {isSwitching ? "Switching..." : roleLabels[currentRole]}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {availableRoles.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                  Switch Role
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableRoles.map((role) => {
                  const RoleIcon = iconMap[role];
                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      disabled={isSwitching}
                      className="gap-2 p-2"
                    >
                      <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-primary/10">
                        <RoleIcon className="h-3 w-3" />
                      </div>
                      <span>{roleLabels[role]}</span>
                      {isSwitching && <RefreshCw className="ml-auto h-3 w-3 animate-spin" />}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
            {availableRoles.length === 0 && (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                No role switching available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
