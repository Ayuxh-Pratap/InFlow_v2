import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createWorkspaceSchema, workspaceIdSchema } from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import { createWorkspaceService, getAllWorkspacesUserIsMemberService, getWorkspaceAnalyticsService, getWorkspaceByIdService, getWorkspaceMembersService } from "../services/workspace.service";
import { getMemberRoleInWorkspaceService } from "../services/member.service";
import { Permissions } from "../enums/role.enum";
import { roleGaurds } from "../utils/roleGaurds";

export const createWorkspaceController = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        const body = createWorkspaceSchema.parse(req.body)
        const userId = req.user?._id;

        const { workspace } = await createWorkspaceService(body, userId);

        return res.status(HTTPSTATUS.CREATED).json({
            message: "Workspace created successfully",
            workspace
        })
    });

export const getAllWorkspaceUserIsMemberController = asyncHandler(
    async (
        req: Request,
        res: Response,
    ) => {
        const userId = req.user?._id;

        const { workspaces } = await getAllWorkspacesUserIsMemberService(userId)
        return res.status(HTTPSTATUS.OK).json({
            message: "Workspaces fetched successfully",
            workspaces
        })
    }
)

export const getWorkspaceByIdController = asyncHandler(
    async (
        req: Request,
        res: Response,
    ) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id)

        const userId = req.user?._id;

        await getMemberRoleInWorkspaceService(userId, workspaceId)

        const { workspace } = await getWorkspaceByIdService(workspaceId)
        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace fetched successfully",
            workspace
        })
    }
)

export const getWorkspaceMembersController = asyncHandler(
    async (
        req: Request,
        res: Response,
    ) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id)
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspaceService(userId, workspaceId)

        roleGaurds(role, [Permissions.VIEW_ONLY])

        const { members, roles } = await getWorkspaceMembersService(workspaceId)

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace members fetched successfully",
            members,
            roles
        })
    }
)

export const getWorkspaceAnalyticsController = asyncHandler(
    async (
        req: Request,
        res: Response,
    ) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id)
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspaceService(userId, workspaceId)
        roleGaurds(role, [Permissions.VIEW_ONLY])

        const { analytics } = await getWorkspaceAnalyticsService(workspaceId)

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace analytics fetched successfully",
            analytics
        })
    }
)