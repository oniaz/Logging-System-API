import { trimString } from "../../../shared/utils/stringUtils.js";
import { isValidLogLevel, LOG_LEVELS } from "../../../domain/entities/LogLevel.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../../../domain/errors/index.js";

export default class CreateLog {
    constructor({ logRepository, applicationRepository }) {
        this.logRepository = logRepository;
        this.applicationRepository = applicationRepository;
    }

    async execute({ applicationName, message, level, ownerId }) {
        if (!message || !level) {
            throw new ValidationError("Missing required fields: message or level");
        }

        const normalizedLevel = level.trim().toUpperCase();
        if (!isValidLogLevel(normalizedLevel)) {
            throw new ValidationError(`Invalid log level. Use ${LOG_LEVELS.map((l) => `"${l}"`).join(", ")}.`);
        }

        const trimmedName = trimString(applicationName);
        const normalizedMessage = message?.trim();

        if (trimmedName === "" || normalizedMessage === "") {
            throw new ValidationError("Application name and log message cannot be empty");
        }

        const application = await this.applicationRepository.findByName(trimmedName);
        if (!application) {
            throw new NotFoundError("Application not found");
        }
        if (application.owner !== ownerId) {
            throw new ForbiddenError("API key does not belong to the application owner");
        }

        const existingLog = await this.logRepository.findOne({
            applicationName: trimmedName,
            message: normalizedMessage,
            level: normalizedLevel,
            owner: ownerId,
        });

        if (existingLog) {
            const updatedLog = await this.logRepository.incrementCount(existingLog.id);
            return { log: updatedLog, wasExisting: true };
        }

        const newLog = await this.logRepository.create({
            applicationName: trimmedName,
            message: normalizedMessage,
            level: normalizedLevel,
            owner: ownerId,
        });
        return { log: newLog, wasExisting: false };
    }
}
