/**
 * API Client with CSRF protection
 *
 * This client automatically:
 * 1. Reads the XSRF-TOKEN cookie
 * 2. Sends it as X-XSRF-TOKEN header on mutations
 * 3. Handles 401 errors by redirecting to login
 */

/**
 * Get a cookie value by name
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

/**
 * Make an API request with CSRF protection
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const headers = new Headers(options.headers || {});

  // Add CSRF token for mutating requests
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  // Set Content-Type for JSON requests
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', // Include cookies
  });

  // Handle authentication errors
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }

  return response;
}

/**
 * GET request helper
 */
export async function apiGet(url) {
  const response = await apiRequest(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

/**
 * POST request helper
 */
export async function apiPost(url, data) {
  const response = await apiRequest(url, {
    method: 'POST',
    body: data,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

/**
 * PUT request helper
 */
export async function apiPut(url, data) {
  const response = await apiRequest(url, {
    method: 'PUT',
    body: data,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

/**
 * DELETE request helper
 */
export async function apiDelete(url) {
  const response = await apiRequest(url, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  // DELETE might return 204 No Content
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export default {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
