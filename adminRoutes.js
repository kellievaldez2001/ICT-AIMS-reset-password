 const FALLBACK_AUTH_HTML = '../main_window/index.html';
const FALLBACK_ADMIN_HTML = '../admin/index.html';
const FALLBACK_DASHBOARD_HTML = '../dashboard/index.html';

const resolveFileUrl = (relativePath) => {
  const { location } = window || {};

  if (!location) {
    return relativePath;
  }

  try {
    if (location.protocol === 'file:') {
      return new URL(relativePath, location.href).href;
    }

    return new URL(relativePath, location.href).href;
  } catch (error) {
    console.warn('Failed to resolve file URL, falling back to relative path.', error);
    return relativePath;
  }
};

const resolveAuthLocation = () => {
  if (typeof MAIN_WINDOW_WEBPACK_ENTRY !== 'undefined') {
    return MAIN_WINDOW_WEBPACK_ENTRY;
  }

  try {
    const { location } = window;

    if (!location) {
      return FALLBACK_AUTH_HTML;
    }

    const isDevServer =
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1') && location.port === '9000';

    if (isDevServer) {
      return `${location.origin}/main_window`;
    }

    if (location.pathname?.includes('/main_window')) {
      return location.href;
    }

    return resolveFileUrl(FALLBACK_AUTH_HTML);
  } catch (error) {
    console.warn('Failed to resolve auth location, falling back to relative path.', error);
    return FALLBACK_AUTH_HTML;
  }
};

export {
  resolveAuthLocation,
  resolveAdminLocation,
  resolveUserDashboardLocation
};

const resolveAdminLocation = () => {
  if (typeof ADMIN_WEBPACK_ENTRY !== 'undefined') {
    return ADMIN_WEBPACK_ENTRY;
  }

  try {
    const { location } = window;

    if (!location) {
      return FALLBACK_ADMIN_HTML;
    }

    if (location.protocol === 'file:') {
      return resolveFileUrl(FALLBACK_ADMIN_HTML);
    }

    const isDevServer =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    const devAdminPath = '/admin/';

    if (isDevServer && location.port === '9000') {
      return `${location.origin}${devAdminPath}`;
    }

    if (location.pathname?.includes('/main_window') || location.pathname?.includes('/auth/')) {
      return `${location.origin}${devAdminPath}`;
    }

    return resolveFileUrl(FALLBACK_ADMIN_HTML);
  } catch (error) {
    console.warn('Failed to resolve admin location, falling back to relative path.', error);
    return FALLBACK_ADMIN_HTML;
  }
};

const resolveUserDashboardLocation = () => {
  if (typeof DASHBOARD_WEBPACK_ENTRY !== 'undefined') {
    return DASHBOARD_WEBPACK_ENTRY;
  }

  try {
    const { location } = window;

    if (!location) {
      return FALLBACK_DASHBOARD_HTML;
    }

    if (location.protocol === 'file:') {
      return resolveFileUrl(FALLBACK_DASHBOARD_HTML);
    }

    const isDevServer =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    const devDashboardPath = '/dashboard/';

    if (isDevServer && location.port === '9000') {
      return `${location.origin}${devDashboardPath}`;
    }

    if (location.pathname?.includes('/main_window') || location.pathname?.includes('/auth/')) {
      return `${location.origin}${devDashboardPath}`;
    }

    return resolveFileUrl(FALLBACK_DASHBOARD_HTML);
  } catch (error) {
    console.warn('Failed to resolve dashboard location, falling back to relative path.', error);
    return FALLBACK_DASHBOARD_HTML;
  }
};
