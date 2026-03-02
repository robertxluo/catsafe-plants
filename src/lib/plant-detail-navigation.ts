const DIRECTORY_PATH = '/plants';
const HOME_PATH = '/';
const BASE_URL = 'http://localhost';

export function buildPlantDetailHref(id: string, returnTo: string) {
  return `/plants/${id}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function sanitizeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return DIRECTORY_PATH;
  }

  try {
    const url = new URL(value, BASE_URL);

    if (url.origin !== BASE_URL) {
      return DIRECTORY_PATH;
    }

    if (url.pathname !== HOME_PATH && url.pathname !== DIRECTORY_PATH) {
      return DIRECTORY_PATH;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return DIRECTORY_PATH;
  }
}

export function getBackLabelForReturnTo(returnTo: string) {
  return returnTo === HOME_PATH ? 'Back to Home' : 'Back to Directory';
}
