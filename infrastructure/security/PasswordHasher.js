import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export default class PasswordHasher {
    async hash(plainPassword) {
        return bcrypt.hash(plainPassword, SALT_ROUNDS);
    }

    async compare(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
