export default class IApplicationRepository {
    async findByName(_name) {
        throw new Error("IApplicationRepository.findByName not implemented");
    }
    async findAllByOwner(_ownerId) {
        throw new Error("IApplicationRepository.findAllByOwner not implemented");
    }
    async create(_data) {
        throw new Error("IApplicationRepository.create not implemented");
    }
    async deleteByNameAndOwner(_name, _ownerId) {
        throw new Error("IApplicationRepository.deleteByNameAndOwner not implemented");
    }
}
