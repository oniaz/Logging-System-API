import { trimString } from "../../../shared/utils/stringUtils.js";
import { isValidLogLevel, LOG_LEVELS } from "../../../domain/entities/LogLevel.js";
import { isValidSortOption, toSortSpec } from "../../../domain/entities/SortOption.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../../../domain/errors/index.js";

export default class GetLogsForApplication {
    constructor({ logRepository, applicationRepository }) {
        this.logRepository = logRepository;
        this.applicationRepository = applicationRepository;
    }

    async execute({ applicationName, ownerId, sort = "desc", page = 1, limit = 10, level, message }) {
        const normalizedSort = sort?.trim().toLowerCase();
        if (!isValidSortOption(normalizedSort)) {
            throw new ValidationError('Invalid sort value. Use "asc", "desc", or "count".');
        }

        if (page < 1 || isNaN(page)) {
            throw new ValidationError("Invalid page number. Page must be a positive integer.");
        }

        if (limit < 1 || isNaN(limit)) {
            throw new ValidationError("Invalid limit value. Limit must be a positive integer.");
        }

        let levelFilter = {};
        if (level) {
            const normalizedLevel = level.trim().toUpperCase();
            if (!isValidLogLevel(normalizedLevel)) {
                throw new ValidationError(`Invalid log level. Use ${LOG_LEVELS.map((l) => `"${l}"`).join(", ")}.`);
            }
            levelFilter = { level: normalizedLevel };
        }

        const messageFilter = message ? { message: { $regex: message, $options: "i" } } : {};

        const trimmedName = trimString(applicationName);

        const application = await this.applicationRepository.findByName(trimmedName);
        if (!application) {
            throw new NotFoundError("Application not found");
        }
        if (application.owner !== ownerId) {
            throw new ForbiddenError("You do not have permission to view logs for this application");
        }

        const sortSpec = toSortSpec(normalizedSort);
        const skip = (page - 1) * limit;

        return this.logRepository.findMany(
            { applicationName: trimmedName, owner: ownerId, ...messageFilter, ...levelFilter },
            sortSpec,
            skip,
            limit
        );
    }
}
