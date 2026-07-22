import { normalizeString } from "../../../shared/utils/stringUtils.js";
import { ValidationError, ConflictError } from "../../../domain/errors/index.js";

export default class RegisterUser {
    constructor({ userRepository, passwordHasher, apiKeyGenerator }) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.apiKeyGenerator = apiKeyGenerator;
    }

    async execute({ username, email, password }) {
        if (!username || !email || !password) {
            throw new ValidationError("Missing required fields: username, email, or password");
        }

        const normalizedEmail = normalizeString(email);
        const existingUser = await this.userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new ConflictError("Email already registered");
        }

        const hashedPassword = await this.passwordHasher.hash(password);
        const apiKey = this.apiKeyGenerator.generate();

        return this.userRepository.create({
            username,
            email: normalizedEmail,
            password: hashedPassword,
            apiKey,
        });
    }
}
