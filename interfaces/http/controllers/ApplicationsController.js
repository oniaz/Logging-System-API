import { toApplicationDTO } from "../presenters/applicationPresenter.js";

export default class ApplicationsController {
    constructor({ getAllApplications, getApplicationByName, createApplication, deleteApplicationByName }) {
        this.getAllApplicationsUseCase = getAllApplications;
        this.getApplicationByNameUseCase = getApplicationByName;
        this.createApplicationUseCase = createApplication;
        this.deleteApplicationByNameUseCase = deleteApplicationByName;

        this.getAll = this.getAll.bind(this);
        this.getByName = this.getByName.bind(this);
        this.create = this.create.bind(this);
        this.deleteByName = this.deleteByName.bind(this);
    }

    async getAll(req, res, next) {
        try {
            const applications = await this.getAllApplicationsUseCase.execute({ ownerId: req.user.id });
            return res.status(200).json(applications.map(toApplicationDTO));
        } catch (error) {
            return next(error);
        }
    }

    async getByName(req, res, next) {
        try {
            const { name } = req.params;
            const application = await this.getApplicationByNameUseCase.execute({ name, ownerId: req.user.id });
            return res.status(200).json(toApplicationDTO(application));
        } catch (error) {
            return next(error);
        }
    }

    async create(req, res, next) {
        try {
            const { name } = req.body;
            const application = await this.createApplicationUseCase.execute({ name, ownerId: req.user.id });
            return res.status(201).json(toApplicationDTO(application));
        } catch (error) {
            return next(error);
        }
    }

    async deleteByName(req, res, next) {
        try {
            const { name } = req.params;
            await this.deleteApplicationByNameUseCase.execute({ name, ownerId: req.user.id });
            return res.status(200).json({ message: `Application ${name} deleted successfully` });
        } catch (error) {
            return next(error);
        }
    }
}
