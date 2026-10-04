// search.js
// Powers the Search Events page:
//   1. Loads the category dropdown from GET /api/categories.
//   2. On submit, calls GET /api/events/search with the chosen criteria.
//   3. Renders the matching events (each linking to its detail page).
//   4. The "Clear Filters" button resets every form field (DOM manipulation).
//   5. Errors and "no results" messages are shown in the message box.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const dateInput = document.getElementById('filter-date');
    const locationInput = document.getElementById('filter-location');
    const categorySelect = document.getElementById('filter-category');
    const clearButton = document.getElementById('clear-filters');
    const resultsGrid = document.getElementById('search-results');
    const messageBox = document.getElementById('search-message');

    // ---- Step 1: populate the category dropdown from the API ----
    apiGet('/categories')
        .then(categories => {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            messageBox.className = 'message message-error';
            messageBox.textContent = 'Categories could not be loaded. Please make sure the API server is running.';
            console.error(error);
        });

    // ---- Step 2: handle the form submission ----
    form.addEventListener('submit', (event) => {
        event.preventDefault();   // stop the browser's default page reload

        // Client-side validation: at least one criterion must be chosen.
        if (!dateInput.value && !locationInput.value.trim() && !categorySelect.value) {
            messageBox.className = 'message message-error';
            messageBox.textContent = 'Please choose at least one search criterion (date, location, or category).';
            resultsGrid.innerHTML = '';
            return;
        }

        // Build the query string from the selected criteria.
        // Empty criteria are left out; the API ignores missing parameters.
        const params = new URLSearchParams();
        if (dateInput.value) {
            params.append('date', dateInput.value);
        }
        if (locationInput.value.trim()) {
            params.append('location', locationInput.value.trim());
        }
        if (categorySelect.value) {
            params.append('category', categorySelect.value);
        }

        messageBox.className = 'message message-info';
        messageBox.textContent = 'Searching events...';
        resultsGrid.innerHTML = '';

        apiGet('/events/search?' + params.toString())
            .then(events => {
                if (events.length === 0) {
                    messageBox.className = 'message message-info';
                    messageBox.textContent = 'No events match your search criteria. Try adjusting the filters.';
                    return;
                }
                messageBox.textContent = '';   // success - clear messages
                events.forEach(event => {
                    resultsGrid.appendChild(buildResultCard(event));
                });
            })
            .catch(error => {
                messageBox.className = 'message message-error';
                messageBox.textContent = 'The search could not be completed. Please try again later.';
                console.error(error);
            });
    });

    // ---- Step 3: "Clear Filters" resets all fields and results ----
    clearButton.addEventListener('click', () => {
        form.reset();                              // resets every input/select
        categorySelect.value = '';                 // make sure "All categories" is selected
        resultsGrid.innerHTML = '';                // remove previous results
        messageBox.textContent = '';               // remove any messages
    });
});

// Creates a result card (summary view + link to the detail page).
function buildResultCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';

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

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'badge badge-category';
    categoryBadge.textContent = event.category;

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (event.event_status === 'past' ? 'badge-past' : 'badge-upcoming');
    statusBadge.textContent = event.event_status === 'past' ? 'Past' : 'Upcoming';

    const meta = document.createElement('p');
    meta.className = 'card-meta';
    meta.textContent = formatDate(event.event_date) + ' | ' + event.location;

    const price = document.createElement('p');
    price.className = 'card-meta';
    price.textContent = event.ticket_price === '0.00'
        ? 'Free entry'
        : 'Ticket: ¥' + Number(event.ticket_price).toFixed(2);

    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const link = document.createElement('a');
    link.className = 'btn btn-outline';
    link.href = 'event.html?id=' + event.event_id;   // pass the id via query string
    link.textContent = 'View Details & Register';
    footer.appendChild(link);

    body.appendChild(title);
    body.appendChild(categoryBadge);
    body.appendChild(document.createTextNode(' '));
    body.appendChild(statusBadge);
    body.appendChild(meta);
    body.appendChild(price);
    body.appendChild(footer);
    card.appendChild(img);
    card.appendChild(body);

    return card;
}

// Shared date formatter (same friendly format as the home page).
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
}
