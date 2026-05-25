import Application from "./applications.model.js";
import { normalizeString } from "../../utils/stringUtils.js";
import Log from "../logs/logs.model.js";

export const getAllApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ owner: req.user.id });

        res.status(200).json(
            applications.map(app => ({
                id: app._id,
                name: app.name,
                createdAt: app.createdAt,
            }))
        );
    } catch (error) {
        return next(error);
    }
}

export const getApplicationByName = async (req, res, next) => {
    try {
        const { name } = req.params;
        const normalizedName = normalizeString(name);
        const application = await Application.findOne({ name: normalizedName, owner: req.user.id });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json({ id: application._id, name: application.name, createdAt: application.createdAt });
    } catch (error) {
        return next(error);
    }
}

export const createApplication = async (req, res, next) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        if (!name?.trim()) {
            return res.status(400).json({ message: 'Application name is required' });
        }

        const normalizedName = normalizeString(name);

        const existingApp = await Application.findOne({ name: normalizedName });
        if (existingApp) {
            return res.status(409).json({ message: 'Application with this name already exists' });
        }

        const newApp = new Application({ name: normalizedName, owner: userId });
        await newApp.save();

        res.status(201).json({ id: newApp._id, name: newApp.name, createdAt: newApp.createdAt });
    } catch (error) {
        return next(error);
    }
}

export const deleteApplicationByName = async (req, res, next) => {
    try {
        const { name } = req.params;
        const normalizedName = normalizeString(name);
        const application = await Application.findOneAndDelete({ name: normalizedName, owner: req.user.id });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        await Log.deleteMany({ applicationName: normalizedName, owner: req.user.id });
        
        res.status(200).json({ message: `Application ${name} deleted successfully` });
    } catch (error) {
        return next(error);
    }
}
