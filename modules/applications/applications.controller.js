import Application from "./applications.model.js";

const normalizeApplicationName = (name) => name?.trim().toLowerCase();

export const getAllApplications = async (req, res) => {
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
        // replace later with error middleware
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getApplicationByName = async (req, res) => {
    try {
        const { name } = req.params;
        const normalizedName = normalizeApplicationName(name);
        const application = await Application.findOne({ name: normalizedName, owner: req.user.id });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json({ id: application._id, name: application.name, createdAt: application.createdAt });
    } catch (error) {
        // replace later with error middleware
        console.error('Error fetching application by name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const createApplication = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        if (!name?.trim()) {
            return res.status(400).json({ message: 'Application name is required' });
        }

        const normalizedName = normalizeApplicationName(name);

        const existingApp = await Application.findOne({ name: normalizedName });
        if (existingApp) {
            return res.status(409).json({ message: 'Application with this name already exists' });
        }

        const newApp = new Application({ name: normalizedName, owner: userId });
        await newApp.save();

        res.status(201).json({ id: newApp._id, name: newApp.name, createdAt: newApp.createdAt });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Application with this name already exists' });
        }
        if (error?.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        // replace later with error middleware
        console.error('Error creating application:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteApplicationByName = async (req, res) => {
    try {
        const { name } = req.params;
        const normalizedName = normalizeApplicationName(name);
        const application = await Application.findOneAndDelete({ name: normalizedName, owner: req.user.id });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json({ message: `Application ${name} deleted successfully` });
    } catch (error) {
        // replace later with error middleware
        console.error('Error deleting application by name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
