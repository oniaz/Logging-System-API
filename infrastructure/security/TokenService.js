import jwt from "jsonwebtoken";

export default class TokenService {
    constructor(secret, { expiresIn = "1d" } = {}) {
        this.secret = secret;
        this.expiresIn = expiresIn;
    }

    sign(payload) {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }

    verify(token) {
        return jwt.verify(token, this.secret);
    }
}
