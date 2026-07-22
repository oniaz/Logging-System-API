import { toLogDTO } from "../presenters/logPresenter.js";

export default class LogsController {
    constructor({ getLogsForApplication, createLog }) {
        this.getLogsForApplicationUseCase = getLogsForApplication;
        this.createLogUseCase = createLog;

        this.getLogs = this.getLogs.bind(this);
        this.createLog = this.createLog.bind(this);
    }

    async getLogs(req, res, next) {
        try {
            const { name } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const logs = await this.getLogsForApplicationUseCase.execute({
                applicationName: name,
                ownerId: req.user.id,
                sort: req.query.sort || "desc",
                page,
                limit,
                level: req.query.level,
                message: req.query.message,
            });

            return res.status(200).json(logs.map(toLogDTO));
        } catch (error) {
            return next(error);
        }
    }

    async createLog(req, res, next) {
        try {
            const { name } = req.params;
            const { message, level } = req.body;

            const { log, wasExisting } = await this.createLogUseCase.execute({
                applicationName: name,
                message,
                level,
                ownerId: req.user.id,
            });

            return res.status(wasExisting ? 200 : 201).json({
                message: wasExisting ? "Existing log updated with new occurrence" : "Log created successfully",
                log: toLogDTO(log),
            });
        } catch (error) {
            return next(error);
        }
    }
}
