import Log from "./logs.model.js";
import { normalizeString, trimString } from "../../utils/stringUtils.js";
import Application from "../applications/applications.model.js";

export const getLogsForApplication = async (req, res, next) => {
    try {
        const sort = req.query.sort || 'desc';
        const normalizedSort = normalizeString(sort);
        const validSortValues = ['asc', 'desc', 'count'];
        if (!validSortValues.includes(normalizedSort)) {
            return res.status(400).json({ message: 'Invalid sort value. Use "asc", "desc", or "count".' });
        }

        const page = parseInt(req.query.page) || 1;
        if (page < 1 || isNaN(page)) {
            return res.status(400).json({ message: 'Invalid page number. Page must be a positive integer.' });
        }

        let levelFilter = {};
        if (req.query.level) {
            const normalizedLevel = req.query.level.trim().toUpperCase();
            const validLevels = ['INFO', 'WARN', 'ERROR'];
            if (!validLevels.includes(normalizedLevel)) {
                return res.status(400).json({ message: 'Invalid log level. Use "INFO", "WARN", or "ERROR".' });
            }
            levelFilter = { level: normalizedLevel };
        }

        const messageFilter = req.query.message ? { message: { $regex: req.query.message, $options: 'i' } } : {};
        const filters = { ...messageFilter, ...levelFilter };

        const limit = parseInt(req.query.limit) || 10;
        if (limit < 1 || isNaN(limit)) {
            return res.status(400).json({ message: 'Invalid limit value. Limit must be a positive integer.' });
        }

        const skip = (page - 1) * limit;

        const { name } = req.params;
        const trimmedName = trimString(name);

        // Ensure the application exists and is owned by this API-key user
        const application = await Application.findOne({ name: trimmedName });
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        if (application.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to view logs for this application' });
        }
        const sortOptions = normalizedSort === 'count'
            ? { count: -1, updatedAt: -1 }
            : { updatedAt: normalizedSort === 'asc' ? 1 : -1 };
        const logs = await Log.find({ applicationName: trimmedName, owner: req.user.id, ...filters }).sort(sortOptions).skip(skip).limit(limit);

        const out = logs.map(l => ({
            id: l._id,
            applicationName: l.applicationName,
            message: l.message,
            level: l.level,
            count: l.count,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt,
        }));
        res.status(200).json(out);

    } catch (error) {
        return next(error);
    }
}

export const createLogForApplication = async (req, res, next) => {
    try {
        const { name } = req.params;
        const { message, level } = req.body;

        if (!message || !level) {
            return res.status(400).json({ message: 'Missing required fields: message or level' });
        }

        const normalizedLevel = level.trim().toUpperCase();
        const validLevels = ['INFO', 'WARN', 'ERROR'];
        if (!validLevels.includes(normalizedLevel)) {
            return res.status(400).json({ message: 'Invalid log level. Use "INFO", "WARN", or "ERROR".' });
        }

        const trimmedName = trimString(name);
        const normalizedMessage = message?.trim();

        if (trimmedName === '' || normalizedMessage === '') {
            return res.status(400).json({ message: 'Application name and log message cannot be empty' });
        }

        const applicationExists = await Application.findOne({ name: trimmedName });
        if (!applicationExists) {
            return res.status(404).json({ message: 'Application not found' });
        }
        if (applicationExists.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'API key does not belong to the application owner' });
        }

        const existingLog = await Log.findOne({ applicationName: trimmedName, message: normalizedMessage, level: normalizedLevel, owner: req.user.id });
        if (existingLog) {
            existingLog.count = (existingLog.count || 0) + 1;
            await existingLog.save();
            return res.status(200).json({
                message: 'Existing log updated with new occurrence',
                log: {
                    id: existingLog._id,
                    applicationName: existingLog.applicationName,
                    message: existingLog.message,
                    level: existingLog.level,
                    count: existingLog.count,
                    createdAt: existingLog.createdAt,
                    updatedAt: existingLog.updatedAt,
                }
            });
        }
        const newLog = new Log({ applicationName: trimmedName, message: normalizedMessage, level: normalizedLevel, owner: req.user.id });
        await newLog.save();
        res.status(201).json({
            message: 'Log created successfully', log: {
                id: newLog._id,
                applicationName: newLog.applicationName,
                message: newLog.message,
                level: newLog.level,
                count: newLog.count,
                createdAt: newLog.createdAt,
                updatedAt: newLog.updatedAt,
            }
        });
    }
    catch (error) {
        return next(error);
    }
}
