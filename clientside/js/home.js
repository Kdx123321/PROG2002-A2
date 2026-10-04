// home.js
// Populates the Home page event listing by calling the API.
// Uses fetch() + Promises and renders the result into the DOM.

document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');
    const messageBox = document.getElementById('home-message');

    // While waiting for the API, show a loading hint.
    messageBox.className = 'message message-info';
    messageBox.textContent = 'Loading events...';

    // GET /api/events returns every active event, with an event_status
    // field ('upcoming' or 'past') computed by the server.
    apiGet('/events')
        .then(events => {
            messageBox.textContent = '';   // clear the loading message

            if (events.length === 0) {
                messageBox.className = 'message message-info';
                messageBox.textContent = 'No charity events are currently available. Please check back soon.';
                return;
            }

            // Build one card per event and append it to the grid.
            events.forEach(event => {
                eventList.appendChild(buildEventCard(event));
            });
        })
        .catch(error => {
            // The API is unreachable (e.g. server not started).
            messageBox.className = 'message message-error';
            messageBox.textContent = 'Sorry, events could not be loaded. Please make sure the API server is running (see api/README.md) and try again.';
            console.error(error);
        });
});

// Creates the DOM elements for a single event summary card.
function buildEventCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';

    // Event image (falls back to a placeholder look if none is set).
    const img = document.createElement('img');
    img.className = 'card-img';
    img.alt = event.name;
    if (event.image_url) {
        img.src = event.image_url;
    }

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.textContent = event.name;

    // Category badge + past/upcoming badge.
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'badge badge-category';
    categoryBadge.textContent = event.category;

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (event.event_status === 'past' ? 'badge-past' : 'badge-upcoming');
    statusBadge.textContent = event.event_status === 'past' ? 'Past' : 'Upcoming';

    const meta = document.createElement('p');
    meta.className = 'card-meta';
    meta.textContent = formatDate(event.event_date) + ' | ' + event.location;

    const blurb = document.createElement('p');
    blurb.textContent = event.short_description;

    // The card links to the event detail page, passing the id in the
    // query string (event.html?id=3).
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const link = document.createElement('a');
    link.className = 'btn btn-outline';
    link.href = 'event.html?id=' + event.event_id;
    link.textContent = 'View Details & Register';
    footer.appendChild(link);

    body.appendChild(title);
    body.appendChild(categoryBadge);
    body.appendChild(document.createTextNode(' '));
    body.appendChild(statusBadge);
    body.appendChild(meta);
    body.appendChild(blurb);
    body.appendChild(footer);
    card.appendChild(img);
    card.appendChild(body);

    return card;
}

// Formats an ISO date string as a friendly, readable date.
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
}
