import { normalizeString } from "../../../shared/utils/stringUtils.js";
import { ValidationError, UnauthorizedError } from "../../../domain/errors/index.js";

export default class LoginUser {
    constructor({ userRepository, passwordHasher, tokenService }) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }

    async execute({ email, password }) {
        if (!email || !password) {
            throw new ValidationError("Missing required fields: email or password");
        }

        const normalizedEmail = normalizeString(email);
        const user = await this.userRepository.findByEmail(normalizedEmail);

        if (!user || !(await this.passwordHasher.compare(password, user.password))) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const token = this.tokenService.sign({ userId: user.id, username: user.username });

        return { user, token };
    }
}
