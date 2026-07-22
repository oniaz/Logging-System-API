export default class IUserRepository {
    async findByEmail(_email) {
        throw new Error("IUserRepository.findByEmail not implemented");
    }
    async findById(_id) {
        throw new Error("IUserRepository.findById not implemented");
    }
    async findByApiKey(_apiKey) {
        throw new Error("IUserRepository.findByApiKey not implemented");
    }
    async create(_userData) {
        throw new Error("IUserRepository.create not implemented");
    }
}
