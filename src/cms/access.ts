import type { Access, AccessArgs, Where } from "payload";

export type UserRole = "admin" | "editor" | "reviewer";

type MinimalUser = {
  id?: number | string;
  roles?: UserRole[] | UserRole;
};

const toRoleArray = (user?: MinimalUser | null): UserRole[] => {
  if (!user?.roles) {
    return [];
  }

  return Array.isArray(user.roles) ? user.roles : [user.roles];
};

export const hasUserRole = (
  user: MinimalUser | null | undefined,
  role: UserRole
): boolean => {
  return toRoleArray(user).includes(role);
};

export const isCmsStaffUser = (
  user: MinimalUser | null | undefined
): boolean => {
  return (
    hasUserRole(user, "admin") ||
    hasUserRole(user, "editor") ||
    hasUserRole(user, "reviewer")
  );
};

export const isReviewerStaffUser = (
  user: MinimalUser | null | undefined
): boolean => {
  return hasUserRole(user, "admin") || hasUserRole(user, "reviewer");
};

export const authenticated: Access = ({ req }) => {
  return Boolean(req.user);
};

export const isAdmin: Access = ({ req }) => {
  return hasUserRole(req.user as MinimalUser | undefined, "admin");
};

export const isAdminOrEditor: Access = ({ req }) => {
  const user = req.user as MinimalUser | undefined;

  return hasUserRole(user, "admin") || hasUserRole(user, "editor");
};

export const isAdminEditorOrReviewer: Access = ({ req }) => {
  const user = req.user as MinimalUser | undefined;

  return isCmsStaffUser(user);
};

export const isAdminOrReviewer: Access = ({ req }) => {
  const user = req.user as MinimalUser | undefined;

  return isReviewerStaffUser(user);
};

export const cmsStaffFieldAccess = ({ req }: AccessArgs): boolean => {
  return isCmsStaffUser(req.user as MinimalUser | undefined);
};

export const reviewerFieldAccess = ({ req }: AccessArgs): boolean => {
  return isReviewerStaffUser(req.user as MinimalUser | undefined);
};

export const adminsAndSelf: Access = ({ req }: AccessArgs): boolean | Where => {
  const user = req.user as MinimalUser | undefined;

  if (!user?.id) {
    return false;
  }

  if (hasUserRole(user, "admin")) {
    return true;
  }

  return {
    id: {
      equals: user.id,
    },
  };
};

export const publishedOnlyForGuests: Access = ({ req }): boolean | Where => {
  if (req.user) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
  };
};
