import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createWorkspaceSchema, workspaceIdSchema } from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import { createWorkspaceService, getAllWorkspacesUserIsMemberService, getWorkspaceByIdService } from "../services/workspace.service";
import { getMemberRoleInWorkspaceService } from "../services/member.service";

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
        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

        const userId = req.user?._id;
        
        await getMemberRoleInWorkspaceService(userId, workspaceId)

        const { workspace } = await getWorkspaceByIdService(workspaceId)
        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace fetched successfully",
            workspace
        })
    }
)