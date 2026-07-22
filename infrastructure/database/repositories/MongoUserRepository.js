import IUserRepository from "../../../domain/repositories/IUserRepository.js";
import UserModel from "../models/UserModel.js";

// Maps a mongoose document to a plain domain object so nothing outside
// of infrastructure ever depends on mongoose directly.
const toEntity = (doc) =>
    doc && {
        id: doc._id.toString(),
        username: doc.username,
        email: doc.email,
        password: doc.password,
        apiKey: doc.apiKey,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };

export default class MongoUserRepository extends IUserRepository {
    async findByEmail(email) {
        const doc = await UserModel.findOne({ email });
        return toEntity(doc);
    }

    async findById(id) {
        const doc = await UserModel.findById(id);
        return toEntity(doc);
    }

    async findByApiKey(apiKey) {
        const doc = await UserModel.findOne({ apiKey });
        return toEntity(doc);
    }

    async create({ username, email, password, apiKey }) {
        const doc = new UserModel({ username, email, password, apiKey });
        await doc.save();
        return toEntity(doc);
    }
}
