export const toLogDTO = (log) => ({
    id: log.id,
    applicationName: log.applicationName,
    message: log.message,
    level: log.level,
    count: log.count,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
});
