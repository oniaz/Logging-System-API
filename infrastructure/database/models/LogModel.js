import mongoose from "mongoose";
import { LOG_LEVELS } from "../../../domain/entities/LogLevel.js";

const logSchema = new mongoose.Schema(
    {
        applicationName: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
        },

        level: {
            type: String,
            enum: LOG_LEVELS,
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
