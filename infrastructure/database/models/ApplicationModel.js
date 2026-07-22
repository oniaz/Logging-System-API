import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[^\s]+$/, "Application name must not contain spaces"],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
