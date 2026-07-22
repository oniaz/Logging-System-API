import { trimString } from "../../../shared/utils/stringUtils.js";
import { NotFoundError } from "../../../domain/errors/index.js";

export default class DeleteApplicationByName {
    constructor({ applicationRepository, logRepository }) {
        this.applicationRepository = applicationRepository;
        this.logRepository = logRepository;
    }

    async execute({ name, ownerId }) {
        const trimmedName = trimString(name);
        const application = await this.applicationRepository.deleteByNameAndOwner(trimmedName, ownerId);

        if (!application) {
            throw new NotFoundError("Application not found");
        }

        await this.logRepository.deleteManyByApplication(trimmedName, ownerId);

        return application;
    }
}
