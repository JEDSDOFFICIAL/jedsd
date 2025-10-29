"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { UserType } from '@prisma/client';

interface RoleContextType {
  currentRole: UserType | null;
  baseRole: UserType | null;
  isRoleSwitched: boolean;
  hasRole: (role: UserType) => boolean;
  hasAnyRole: (roles: UserType[]) => boolean;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

/**
 * Role Context Provider
 * 
 * Provides centralized role management throughout the application.
 * Handles both base user type and variable (switched) user type.
 */
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const roleData = useMemo<RoleContextType>(() => {
    if (status === 'loading') {
      return {
        currentRole: null,
        baseRole: null,
        isRoleSwitched: false,
        hasRole: () => false,
        hasAnyRole: () => false,
        isLoading: true,
      };
    }

    if (!session?.user) {
      return {
        currentRole: null,
        baseRole: null,
        isRoleSwitched: false,
        hasRole: () => false,
        hasAnyRole: () => false,
        isLoading: false,
      };
    }

    const baseRole = session.user.userType as UserType;
    const currentRole = (session.user.variableUserType || session.user.userType) as UserType;
    const isRoleSwitched = currentRole !== baseRole;

    return {
      currentRole,
      baseRole,
      isRoleSwitched,
      hasRole: (role: UserType) => currentRole === role,
      hasAnyRole: (roles: UserType[]) => roles.includes(currentRole),
      isLoading: false,
    };
  }, [session, status]);

  return (
    <RoleContext.Provider value={roleData}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to access role context
 * 
 * @throws Error if used outside RoleProvider
 */
export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

/**
 * Higher-order component for role-based access control
 * 
 * @param allowedRoles - Array of roles that can access the component
 * @param fallback - Component to render if access is denied
 */
export function withRoleAccess<T extends object>(
  allowedRoles: UserType[],
  fallback?: React.ComponentType<T>
) {
  return function WithRoleAccessWrapper(Component: React.ComponentType<T>) {
    return function WrappedComponent(props: T) {
      const { hasAnyRole, isLoading } = useRole();

      if (isLoading) {
        return <div>Loading...</div>;
      }

      if (!hasAnyRole(allowedRoles)) {
        if (fallback) {
          const FallbackComponent = fallback;
          return <FallbackComponent {...props} />;
        }
        return <div>Access Denied</div>;
      }

      return <Component {...props} />;
    };
  };
}

/**
 * Component for conditional rendering based on roles
 */
interface RoleGuardProps {
  allowedRoles: UserType[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, fallback, children }: RoleGuardProps) {
  const { hasAnyRole, isLoading } = useRole();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user has specific permissions
 */
export function usePermissions() {
  const { currentRole, hasRole, hasAnyRole } = useRole();

  return {
    canUploadPaper: hasRole('AUTHOR' as UserType),
    canReviewPaper: hasRole('REVIEWER' as UserType),
    canManagePapers: hasAnyRole(['EDITOR', 'ADMIN'] as UserType[]),
    canManageUsers: hasRole('ADMIN' as UserType),
    canAllocateReviewers: hasAnyRole(['EDITOR', 'ADMIN'] as UserType[]),
    canViewAnalytics: hasAnyRole(['EDITOR', 'ADMIN'] as UserType[]),
    canSwitchRoles: hasAnyRole(['EDITOR', 'REVIEWER', 'ADMIN'] as UserType[]),
    isAdmin: hasRole('ADMIN' as UserType),
    isEditor: hasRole('EDITOR' as UserType),
    isReviewer: hasRole('REVIEWER' as UserType),
    isAuthor: hasRole('AUTHOR' as UserType),
    currentRole,
  };
}