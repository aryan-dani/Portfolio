// Utility to get the correct asset path with base URL
export const getAssetPath = (path) => {
  // If it's an external URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = import.meta.env.BASE_URL;
  // Remove leading slash from path if present, since base already ends with /
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${cleanPath}`;
};
