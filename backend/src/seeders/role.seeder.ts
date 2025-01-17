import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/db.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/role-permission";

const seedRoles = async () => {
    console.log("Seeding roles...");

    try {
        await connectDatabase();
        const session = await mongoose.startSession();
        session.startTransaction();

        console.log("Creating roles...");
        await RoleModel.deleteMany({}, { session });

        for (const roleName in RolePermissions) {
            const role = roleName as keyof typeof RolePermissions;
            const permissions = RolePermissions[role];

            // check if role already exists
            const existingRole = await RoleModel.findOne({ name: role }).session(session);
            if (!existingRole) {
                const newRole = new RoleModel({
                    name: role,
                    permissions,
                });
                await newRole.save({ session });
                console.log(`Created role: ${role}`);
            } else {
                console.log(`Role ${role} already exists`);
            }
        }

        await session.commitTransaction();
        console.log("Roles seeded transaction completed");

        session.endSession();
        console.log("session ended");
    } catch (error) {
        console.error("Error seeding roles:", error);
    }

}

seedRoles().catch((error) => {
    console.error("Error seeding roles:", error);
})