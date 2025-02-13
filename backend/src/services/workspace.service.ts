import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";

export const createWorkspaceService =
    async (
        body: {
            name: string,
            description?: string | null
        },
        userId: string
    ) => {
        const { name, description } = body;

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });

        if (!ownerRole) {
            throw new NotFoundException("Owner role not found");
        }

        const workspace = new WorkspaceModel({
            name,
            description,
            owner: user._id,
        });

        await workspace.save();

        const member = new MemberModel({
            userId: user._id,
            workspaceId: workspace._id,
            role: ownerRole._id,
            joinedAt: new Date(),
        });

        await member.save();

        user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
        await user.save();

        return { workspace };
    }

export const getAllWorkspacesUserIsMemberService =
    async (
        userId: string
    ) => {
        const memberships = await MemberModel.find({ userId })
            .populate("workspaceId")
            .select("-password")
            .exec()

        const workspaces = memberships.map((membership) => membership.workspaceId)

        return {
            workspaces
        }
    }

export const getWorkspaceByIdService =
    async (
        workspaceId: string
    ) => {
        const workspace = await WorkspaceModel.findById(workspaceId)

        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        const member = await MemberModel.find({ workspaceId })
            .populate("role")

        const workspaceWithMembers = {
            ...workspace.toObject(),
            member
        }

        return {
            workspace: workspaceWithMembers
        }
    }

export const getWorkspaceMembersController =
    async (
        workspaceId: string
    ) => {
        const members = await MemberModel.find({ workspaceId })
            .populate("userId", "name email")
            .populate("role")

        return {
            members
        }
    }

export const getWorkspaceMembersService =
    async (
        workspaceId: string
    ) => {
        const members = await MemberModel.find({ workspaceId })
            .populate("userId", "name email profilePicture -password")
            .populate("role", "name")

        const roles = await RoleModel.find({}, { name: 1, _id: 1 })
            .select("-permissions").lean()

        return {
            members,
            roles
        }
    }

export const getWorkspaceAnalyticsService =
    async (
        workspaceId: string
    ) => {
        const currentDate = new Date();

        const totalTasks = await TaskModel.countDocuments({
            workspace: workspaceId,
        })

        const overdueTasks = await TaskModel.countDocuments({
            workspace: workspaceId,
            dueDate: { $lt: currentDate },
            status: { $ne: TaskStatusEnum.DONE }
        })

        const completedTasks = await TaskModel.countDocuments({
            workspace: workspaceId,
            status: TaskStatusEnum.DONE
        })

        const analytics = {
            totalTasks,
            overdueTasks,
            completedTasks
        }

        return { analytics }
    }

export const changeMemberRoleService =
    async (
        memberId: string,
        roleId: string,
        workspaceId: string
    ) => {
        const workspace = await WorkspaceModel.findById(workspaceId)

        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        const role = await RoleModel.findById(roleId)

        if (!role) {
            throw new NotFoundException("Role not found");
        }

        const member = await MemberModel.findOne({
            userId: memberId,
            workspaceId: workspaceId
        })

        if (!member) {
            throw new NotFoundException("Member not found");
        }

        member.role = role
        await member.save()

        return { member }
    }
