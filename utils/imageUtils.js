/**
 * Helper function to construct full image URL from backend
 * Uses Next.js API proxy route (/api/uploads) to avoid mixed content issues
 * when transitioning from HTTP to HTTPS with a custom domain
 * 
 * @param {string} imagePath - The image path from backend (e.g., '/uploads/logo.png')
 * @returns {string|null} - Full URL to access the image
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Extract the actual file path (e.g., '/uploads/images/file.png' -> 'images/file.png')
    let filePath = imagePath;
    if (imagePath.startsWith('/uploads/')) {
        filePath = imagePath.replace('/uploads/', '');
    }

    // Always use local API proxy route to serve images
    // This ensures HTTPS compatibility and avoids mixed content warnings
    // The API route at /api/uploads/[...path] serves from the symlinked backend uploads folder
    return `/api/uploads/${filePath}`;
};

/**
 * Helper function to construct full URLs for array of image paths
 * 
 * @param {string[]} imagePaths - Array of image paths
 * @returns {string[]} - Array of full URLs
 */
export const getImageUrls = (imagePaths) => {
    if (!Array.isArray(imagePaths)) return [];
    return imagePaths.map(path => getImageUrl(path)).filter(url => url !== null);
};

/**
 * Parse JSON string safely
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed value or default
 */
export const parseJSON = (jsonString, defaultValue = []) => {
    if (!jsonString) return defaultValue;
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return defaultValue;
    }
};
