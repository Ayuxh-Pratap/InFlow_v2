import { PermissionType } from "../enums/role.enum";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./role-permission";

export const roleGaurds = (role: keyof typeof RolePermissions, requiredPermissions: PermissionType[]) => {
    const Permissions = RolePermissions[role];
    if (!Permissions) {
        throw new Error("Role not found");
    }

    const hasPermission = requiredPermissions.every(permission => Permissions.includes(permission));
    if (!hasPermission) {
        throw new UnauthorizedException("You do not have permission to perform this action");
    }
}