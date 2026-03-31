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

export const isAdminOrReviewer: Access = ({ req }) => {
  const user = req.user as MinimalUser | undefined;

  return hasUserRole(user, "admin") || hasUserRole(user, "reviewer");
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
