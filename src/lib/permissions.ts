import { UserType, User } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  variableUserType: UserType;
}

async function getDbUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function canViewManuscript(user: SessionUser, authorId?: string | null): Promise<boolean> {
  if (user.variableUserType === UserType.ADMIN) return true;
  if (user.variableUserType === UserType.EDITOR) return true;
  if (user.variableUserType === UserType.AUTHOR && user.id === authorId) return true;
  return false;
}

export async function canEditManuscript(user: SessionUser, authorId?: string | null): Promise<boolean> {
  if (user.variableUserType === UserType.ADMIN) return true;
  if (user.variableUserType === UserType.AUTHOR && user.id === authorId) return true;
  return false;
}

export async function canAssignReviewer(user: SessionUser): Promise<boolean> {
  return user.variableUserType === UserType.ADMIN || user.variableUserType === UserType.EDITOR;
}

export async function canRequestRevision(user: SessionUser): Promise<boolean> {
  return user.variableUserType === UserType.ADMIN || user.variableUserType === UserType.EDITOR;
}

export async function canAcceptManuscript(user: SessionUser): Promise<boolean> {
  return user.variableUserType === UserType.ADMIN || user.variableUserType === UserType.EDITOR;
}

export async function canPublish(user: SessionUser): Promise<boolean> {
  if (user.variableUserType === UserType.ADMIN) return true;
  if (user.variableUserType === UserType.EDITOR) return true;
  const dbUser = await getDbUser(user.id);
  return !!dbUser?.canPublish;
}

export async function canAssignDOI(user: SessionUser): Promise<boolean> {
  if (user.variableUserType === UserType.ADMIN) return true;
  if (user.variableUserType === UserType.EDITOR) return true;
  const dbUser = await getDbUser(user.id);
  return !!dbUser?.canAssignDoi;
}

export async function canUploadPublicationFiles(user: SessionUser): Promise<boolean> {
  if (user.variableUserType === UserType.ADMIN) return true;
  if (user.variableUserType === UserType.EDITOR) return true;
  const dbUser = await getDbUser(user.id);
  return !!dbUser?.canUploadPublicationFiles;
}

