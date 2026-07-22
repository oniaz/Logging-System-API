export const LOG_SORT_OPTIONS = Object.freeze(["asc", "desc", "count"]);

export const isValidSortOption = (sort) => LOG_SORT_OPTIONS.includes(sort);

// Translates a validated sort option into a mongo-style sort spec.
// Kept here (not in infrastructure) because "what count/asc/desc mean"
// is a business rule, not a persistence detail.
export const toSortSpec = (sort) =>
    sort === "count"
        ? { count: -1, updatedAt: -1 }
        : { updatedAt: sort === "asc" ? 1 : -1 };
