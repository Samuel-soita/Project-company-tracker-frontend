// Environment configuration with fallbacks
const API_BASE_URL = import.meta.env.VITE_API_URL ||
                    (import.meta.env.DEV ? 'http://localhost:5000' : '');

// Validate required environment variables
if (!API_BASE_URL && import.meta.env.PROD) {
    console.error('VITE_API_URL is required in production environment');
}

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    getAuthHeaders() {
        // JWT tokens are now handled via httpOnly cookies by the backend
        // No need to manually set Authorization headers - cookies are sent automatically
        const headers = {
            'Content-Type': 'application/json',
        };

        return headers;
    }

    async request(endpoint, options = {}, retries = 3) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
            credentials: 'include', // Send cookies with all requests
        };

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, config);

                // Handle 401 Unauthorized
                if (response.status === 401) {
                    // Clear user data and redirect to login
                    // Backend should clear the httpOnly cookie
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error('Unauthorized');
                }

                // Handle 429 Too Many Requests (rate limiting)
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
                    if (attempt < retries) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }

                // Handle 5xx server errors with retry
                if (response.status >= 500 && attempt < retries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                let data;
                try {
                    data = await response.json();
                } catch {
                    // Handle non-JSON responses (like network errors)
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                if (!response.ok) {
                    // Handle specific error cases
                    if (response.status === 401) {
                        throw new Error(data.message || 'Authentication failed');
                    }
                    if (response.status === 429) {
                        throw new Error('Too many requests. Please try again later.');
                    }
                    if (response.status >= 500) {
                        throw new Error('Server error. Please try again later.');
                    }
                    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
                }

                return data;
            } catch (error) {
                // Handle network errors (connection refused, timeout, etc.)
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    const networkError = new Error('Unable to connect to the server. Please check your connection and try again.');
                    networkError.code = 'NETWORK_ERROR';
                    throw networkError;
                }

                // Don't retry on client errors (4xx) except 401 and 429
                if (attempt === retries || (error.message.includes('HTTP 4') && !error.message.includes('401') && !error.message.includes('429'))) {
                    console.error('API Error:', error);
                    throw error;
                }

                // Retry on server errors (5xx) or network issues
                if (attempt < retries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                console.error('API Error:', error);
                throw error;
            }
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new APIClient(API_BASE_URL);