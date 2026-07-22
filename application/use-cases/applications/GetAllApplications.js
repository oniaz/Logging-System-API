export default class GetAllApplications {
    constructor({ applicationRepository }) {
        this.applicationRepository = applicationRepository;
    }

    async execute({ ownerId }) {
        return this.applicationRepository.findAllByOwner(ownerId);
    }
}
