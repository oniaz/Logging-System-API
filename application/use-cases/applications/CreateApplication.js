import { trimString } from "../../../shared/utils/stringUtils.js";
import { ValidationError, ConflictError } from "../../../domain/errors/index.js";

export default class CreateApplication {
    constructor({ applicationRepository }) {
        this.applicationRepository = applicationRepository;
    }

    async execute({ name, ownerId }) {
        if (!name?.trim()) {
            throw new ValidationError("Application name is required");
        }

        const trimmedName = trimString(name);

        const existingApp = await this.applicationRepository.findByName(trimmedName);
        if (existingApp) {
            throw new ConflictError("Application with this name already exists");
        }

        return this.applicationRepository.create({ name: trimmedName, owner: ownerId });
    }
}
