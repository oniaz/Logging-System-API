export default class UsersController {
    constructor({ registerUser, loginUser, isProduction }) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
        this.isProduction = isProduction;

        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.getApiKey = this.getApiKey.bind(this);
    }

    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;
            await this.registerUser.execute({ username, email, password });
            return res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            return next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { token } = await this.loginUser.execute({ email, password });

            res.cookie("token", token, {
                httpOnly: true,
                secure: this.isProduction,
                sameSite: this.isProduction ? "none" : "lax",
                maxAge: 24 * 60 * 60 * 1000,
            });

            return res.status(200).json({ message: "Login successful" });
        } catch (error) {
            return next(error);
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: this.isProduction,
                sameSite: this.isProduction ? "none" : "lax",
            }).status(200).json({ message: "Logout successful" });
        } catch (error) {
            return next(error);
        }
    }

    async getApiKey(req, res, next) {
        try {
            return res.status(200).json({ apiKey: req.user.apiKey });
        } catch (error) {
            return next(error);
        }
    }
}
