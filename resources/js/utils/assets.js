export const assetUrl = (path) => {
    if (!path) {
        return '';
    }

    return path.startsWith('/') || path.startsWith('http') ? path : `/${path}`;
};
