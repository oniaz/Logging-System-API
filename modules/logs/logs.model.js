import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
    {
        applicationName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        message: {
            type: String,
            required: true,
        },

        level: {
            type: String,
            enum: ["info", "warn", "error"],
            required: true,
            lowercase: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        count: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Log || mongoose.model("Log", logSchema);
