// api.js
// Shared API configuration for the Charity Events client-side website.
// Every page includes this file first, then its own page script.

// Base URL of the RESTful API (server.js must be running - see api/README.md).
const API_BASE = 'http://localhost:3000/api';

// Small helper that wraps fetch() and always parses the JSON response.
// Rejects with a friendly Error when the server responds with an error
// status code, so each page can show a message with basic DOM manipulation.
function apiGet(path) {
    return fetch(API_BASE + path)
        .then(response => {
            // response.ok is false for 4xx / 5xx status codes
            if (!response.ok) {
                throw new Error('Request failed with status ' + response.status);
            }
            return response.json();   // parse the JSON body (returns a Promise)
        });
}
