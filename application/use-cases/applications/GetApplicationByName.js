import { trimString } from "../../../shared/utils/stringUtils.js";
import { NotFoundError, ForbiddenError } from "../../../domain/errors/index.js";

export default class GetApplicationByName {
    constructor({ applicationRepository }) {
        this.applicationRepository = applicationRepository;
    }

    async execute({ name, ownerId }) {
        const trimmedName = trimString(name);
        const application = await this.applicationRepository.findByName(trimmedName);

        if (!application || application.owner !== ownerId) {
            throw new NotFoundError("Application not found");
        }

        return application;
    }
}
