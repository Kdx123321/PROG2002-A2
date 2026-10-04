// event.js
// Powers the Event Detail page.
// The event id is passed from the Home/Search pages via the URL query
// string (event.html?id=3), read here with URLSearchParams, and then the
// full details are fetched from GET /api/events/:id and rendered into
// the page with DOM manipulation.

document.addEventListener('DOMContentLoaded', () => {
    const messageBox = document.getElementById('detail-message');
    const detailCard = document.getElementById('detail-card');

    // ---- Read the event id from the query string ----
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        showError(messageBox, 'No event was selected. Please choose an event from the Home or Search page.');
        return;
    }

    // ---- Fetch the full details for this event ----
    apiGet('/events/' + encodeURIComponent(eventId))
        .then(event => {
            renderEvent(event, detailCard);
        })
        .catch(error => {
            if (error.message.includes('404')) {
                showError(messageBox, 'The event you are looking for does not exist or is no longer available.');
            } else {
                showError(messageBox, 'Event details could not be loaded. Please make sure the API server is running and try again.');
            }
            console.error(error);
        });

    // ---- Register button: show "under construction" modal ----
    const modal = document.getElementById('register-modal');
    document.getElementById('register-btn').addEventListener('click', () => {
        modal.classList.add('show');       // display the modal overlay
    });
    document.getElementById('modal-close').addEventListener('click', () => {
        modal.classList.remove('show');    // hide the modal overlay
    });
    // Clicking the dark background also closes the modal.
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// Fills every placeholder in the detail card with the API data.
function renderEvent(event, card) {
    document.getElementById('detail-name').textContent = event.name;

    const categoryBadge = document.getElementById('detail-category');
    categoryBadge.textContent = event.category;

    const statusBadge = document.getElementById('detail-status');
    statusBadge.textContent = event.event_status === 'past' ? 'Past Event' : 'Upcoming Event';
    statusBadge.className = 'badge ' + (event.event_status === 'past' ? 'badge-past' : 'badge-upcoming');

    document.getElementById('detail-organisation').textContent =
        'Hosted by ' + event.organisation;

    document.getElementById('detail-date').textContent = formatDate(event.event_date);
    document.getElementById('detail-location').textContent =
        event.location + ', ' + event.city;
    document.getElementById('detail-purpose').textContent = event.purpose;
    document.getElementById('detail-org-name').textContent = event.organisation;
    document.getElementById('detail-description').textContent = event.full_description;

    // Goal vs progress: width of the progress bar = funds_raised / goal.
    const goal = Number(event.fundraising_goal);
    const raised = Number(event.funds_raised);
    const percent = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

    const progressBar = document.getElementById('detail-progress');
    progressBar.style.width = percent + '%';

    document.getElementById('detail-progress-label').textContent =
        '¥' + raised.toLocaleString('en-AU') + ' raised of ¥' +
        goal.toLocaleString('en-AU') + ' goal (' + percent + '%)';

    // Ticket information.
    const price = Number(event.ticket_price);
    document.getElementById('detail-price').textContent =
        price === 0 ? 'FREE' : '¥' + price.toFixed(2) + ' per ticket';
    document.getElementById('detail-ticket-info').textContent = event.ticket_info;

    // Event image (hidden if the event has none).
    const image = document.getElementById('detail-image');
    if (event.image_url) {
        image.src = event.image_url;
        image.alt = event.name;
    } else {
        image.style.display = 'none';
    }

    card.style.display = 'block';   // reveal the populated card
}

// Shows a friendly error and keeps the detail card hidden.
function showError(messageBox, text) {
    messageBox.className = 'message message-error';
    messageBox.textContent = text;
}

// Friendly date formatting (matches the other pages).
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
}
