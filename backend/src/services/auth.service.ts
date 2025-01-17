import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import { Roles } from "../enums/role.enum";
import RoleModel from "../models/roles-permission.model";
import MemberModel from "../models/member.model";

export const loginOrCreateAccountService = async (
    data: {
        provider: string;
        displayName: string;
        providerId: string;
        picture?: string;
        email?: string
    }) => {
    const {
        provider,
        displayName,
        providerId,
        picture,
        email
    } = data;

    const session = await mongoose.startSession();



    try {
        session.startTransaction();
        console.log("session started");
        let user = await UserModel.findOne({ email }).session(session);
        if (!user) {
            user = new UserModel({
                email,
                name: displayName,
                profilePicture: picture || null,
            });
            await user.save({ session });
            console.log("User created");

            const account = new AccountModel({
                userId: user._id,
                provider: provider,
                providerId: providerId,
            })
            await account.save({ session });
            console.log("Account created");

            const Workspace = new WorkspaceModel({
                name: `${user.name}'s Workspace`,
                description: "This is your workspace",
                owner: user._id,
            })
            await Workspace.save({ session });
            console.log("Workspace created");

            const ownerRole = await RoleModel.findOne({ name: Roles.OWNER }).session(session);

            if (!ownerRole) {
                throw new Error("Owner role not found");
            }

            const member = new MemberModel({
                workspaceId: Workspace._id,
                userId: user._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            })
            await member.save({ session });
            console.log("Member created");

            user.currentWorkspace = Workspace._id as mongoose.Types.ObjectId;
            await user.save({ session });
            console.log("User updated");
        }

        await session.commitTransaction();
        session.endSession();
        console.log("session ended");
        return { user };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log("session ended");
        throw error;
    } finally {
        session.endSession();
        console.log("session ended");
    }
}