export default class ILogRepository {
    async findOne(_filter) {
        throw new Error("ILogRepository.findOne not implemented");
    }
    async findMany(_filter, _sortSpec, _skip, _limit) {
        throw new Error("ILogRepository.findMany not implemented");
    }
    async create(_data) {
        throw new Error("ILogRepository.create not implemented");
    }
    async incrementCount(_id) {
        throw new Error("ILogRepository.incrementCount not implemented");
    }
    async deleteManyByApplication(_applicationName, _ownerId) {
        throw new Error("ILogRepository.deleteManyByApplication not implemented");
    }
}
