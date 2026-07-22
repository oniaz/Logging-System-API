import IApplicationRepository from "../../../domain/repositories/IApplicationRepository.js";
import ApplicationModel from "../models/ApplicationModel.js";

const toEntity = (doc) =>
    doc && {
        id: doc._id.toString(),
        name: doc.name,
        owner: doc.owner.toString(),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };

export default class MongoApplicationRepository extends IApplicationRepository {
    async findByName(name) {
        const doc = await ApplicationModel.findOne({ name });
        return toEntity(doc);
    }

    async findAllByOwner(ownerId) {
        const docs = await ApplicationModel.find({ owner: ownerId });
        return docs.map(toEntity);
    }

    async create({ name, owner }) {
        const doc = new ApplicationModel({ name, owner });
        await doc.save();
        return toEntity(doc);
    }

    async deleteByNameAndOwner(name, ownerId) {
        const doc = await ApplicationModel.findOneAndDelete({ name, owner: ownerId });
        return toEntity(doc);
    }
}
