import { PrismaClient, UserType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Synchronizes UserDetails with User table for role management
 * @param email - User email
 * @param newUserType - New user type to set
 */
export async function syncUserDetails(email: string, newUserType: UserType) {
  try {
    // If setting to a special role (ADMIN, EDITOR, REVIEWER)
    if (newUserType !== "USER") {
      const existingUserDetails = await prisma.userDetails.findUnique({
        where: { email }
      });

      if (existingUserDetails) {
        // Update existing entry
        await prisma.userDetails.update({
          where: { email },
          data: { userType: newUserType }
        });
      } else {
        // Create new entry
        await prisma.userDetails.create({
          data: {
            email,
            userType: newUserType
          }
        });
      }
    } else {
      // If setting to USER, remove from UserDetails
      await prisma.userDetails.deleteMany({
        where: { email }
      });
    }

    // Update the main User table
    await prisma.user.updateMany({
      where: { email },
      data: { userType: newUserType }
    });

    return { success: true };
  } catch (error) {
    console.error("Error syncing UserDetails:", error);
    return { success: false, error };
  }
}

/**
 * Gets the effective user type for an email
 * Priority: UserDetails > User table > default USER
 * @param email - User email
 */
export async function getEffectiveUserType(email: string): Promise<UserType> {
  try {
    // Check UserDetails first
    const userDetails = await prisma.userDetails.findUnique({
      where: { email }
    });

    if (userDetails) {
      return userDetails.userType;
    }

    // Check User table
    const user = await prisma.user.findUnique({
      where: { email }
    });

    return user?.userType || "USER";
  } catch (error) {
    console.error("Error getting effective user type:", error);
    return "USER";
  }
}

/**
 * Validates if an email has permission for a specific role
 * @param email - User email
 * @param requiredRole - Required role to check
 */
export async function hasRolePermission(email: string, requiredRole: UserType): Promise<boolean> {
  try {
    const effectiveUserType = await getEffectiveUserType(email);
    
    // Define role hierarchy: ADMIN > EDITOR > REVIEWER > USER
    const roleHierarchy = {
      "ADMIN": 4,
      "EDITOR": 3,
      "REVIEWER": 2,
      "USER": 1
    };

    const currentLevel = roleHierarchy[effectiveUserType] || 1;
    const requiredLevel = roleHierarchy[requiredRole] || 1;

    return currentLevel >= requiredLevel;
  } catch (error) {
    console.error("Error checking role permission:", error);
    return false;
  }
}
