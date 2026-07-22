import ILogRepository from "../../../domain/repositories/ILogRepository.js";
import LogModel from "../models/LogModel.js";

const toEntity = (doc) =>
    doc && {
        id: doc._id.toString(),
        applicationName: doc.applicationName,
        message: doc.message,
        level: doc.level,
        owner: doc.owner.toString(),
        count: doc.count,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };

export default class MongoLogRepository extends ILogRepository {
    async findOne(filter) {
        const doc = await LogModel.findOne(filter);
        return toEntity(doc);
    }

    async findMany(filter, sortSpec, skip, limit) {
        const docs = await LogModel.find(filter).sort(sortSpec).skip(skip).limit(limit);
        return docs.map(toEntity);
    }

    async create({ applicationName, message, level, owner }) {
        const doc = new LogModel({ applicationName, message, level, owner });
        await doc.save();
        return toEntity(doc);
    }

    async incrementCount(id) {
        const doc = await LogModel.findByIdAndUpdate(
            id,
            { $inc: { count: 1 } },
            { new: true }
        );
        return toEntity(doc);
    }

    async deleteManyByApplication(applicationName, ownerId) {
        return LogModel.deleteMany({ applicationName, owner: ownerId });
    }
}
