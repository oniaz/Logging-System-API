export const toApplicationDTO = (application) => ({
    id: application.id,
    name: application.name,
    createdAt: application.createdAt,
});
