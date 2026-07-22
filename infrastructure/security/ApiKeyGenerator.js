import crypto from "crypto";

export default class ApiKeyGenerator {
    generate() {
        return crypto.randomBytes(32).toString("hex");
    }
}
