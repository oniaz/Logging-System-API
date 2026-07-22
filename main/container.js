// Composition root: the ONLY place that knows about concrete
// infrastructure implementations and wires them into use cases,
// controllers, middleware, and routers. Nothing in domain/ or
// application/ ever imports from here.

import { env } from "../config/env.js";

import MongoUserRepository from "../infrastructure/database/repositories/MongoUserRepository.js";
import MongoApplicationRepository from "../infrastructure/database/repositories/MongoApplicationRepository.js";
import MongoLogRepository from "../infrastructure/database/repositories/MongoLogRepository.js";

import PasswordHasher from "../infrastructure/security/PasswordHasher.js";
import ApiKeyGenerator from "../infrastructure/security/ApiKeyGenerator.js";
import TokenService from "../infrastructure/security/TokenService.js";

import RegisterUser from "../application/use-cases/users/RegisterUser.js";
import LoginUser from "../application/use-cases/users/LoginUser.js";

import CreateApplication from "../application/use-cases/applications/CreateApplication.js";
import GetAllApplications from "../application/use-cases/applications/GetAllApplications.js";
import GetApplicationByName from "../application/use-cases/applications/GetApplicationByName.js";
import DeleteApplicationByName from "../application/use-cases/applications/DeleteApplicationByName.js";

import GetLogsForApplication from "../application/use-cases/logs/GetLogsForApplication.js";
import CreateLog from "../application/use-cases/logs/CreateLog.js";

import UsersController from "../interfaces/http/controllers/UsersController.js";
import ApplicationsController from "../interfaces/http/controllers/ApplicationsController.js";
import LogsController from "../interfaces/http/controllers/LogsController.js";

import { createAuthMiddleware } from "../interfaces/http/middleware/auth.middleware.js";

export const buildContainer = () => {
    // --- repositories (adapters implementing domain ports) ---
    const userRepository = new MongoUserRepository();
    const applicationRepository = new MongoApplicationRepository();
    const logRepository = new MongoLogRepository();

    // --- infrastructure services ---
    const passwordHasher = new PasswordHasher();
    const apiKeyGenerator = new ApiKeyGenerator();
    const tokenService = new TokenService(env.jwtSecret);

    // --- use cases ---
    const registerUser = new RegisterUser({ userRepository, passwordHasher, apiKeyGenerator });
    const loginUser = new LoginUser({ userRepository, passwordHasher, tokenService });

    const createApplication = new CreateApplication({ applicationRepository });
    const getAllApplications = new GetAllApplications({ applicationRepository });
    const getApplicationByName = new GetApplicationByName({ applicationRepository });
    const deleteApplicationByName = new DeleteApplicationByName({ applicationRepository, logRepository });

    const getLogsForApplication = new GetLogsForApplication({ logRepository, applicationRepository });
    const createLog = new CreateLog({ logRepository, applicationRepository });

    // --- controllers ---
    const usersController = new UsersController({ registerUser, loginUser, isProduction: env.isProduction });
    const applicationsController = new ApplicationsController({
        getAllApplications,
        getApplicationByName,
        createApplication,
        deleteApplicationByName,
    });
    const logsController = new LogsController({ getLogsForApplication, createLog });

    // --- middleware ---
    const { jwtMiddleware, apiKeyMiddleware } = createAuthMiddleware({ userRepository, tokenService });

    return {
        usersController,
        applicationsController,
        logsController,
        jwtMiddleware,
        apiKeyMiddleware,
    };
};
