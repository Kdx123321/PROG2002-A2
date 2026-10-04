// server.js
// Express RESTful API for the Charity Events website (PROG2002 A2).
//
// The API exposes the charity event data stored in the MySQL database
// (charityevents_db) so that the client-side website can consume it.
//
// Endpoints (all GET, as required for this assessment):
//   GET /api/events           -> all active events (upcoming first, then past),
//                               including category and organisation names.
//   GET /api/events/search    -> search active events by date, location and/or
//                               category: /api/events/search?date=YYYY-MM-DD&location=text&category=id
//   GET /api/events/:id       -> full details of one active event (404 if not
//                               found or suspended).
//   GET /api/categories       -> all event categories (used to build the
//                               category filter on the search page).
//
// Run with:  npm install   then   npm start   (server listens on port 3000)

const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = 3000;

// Enable CORS so the client-side website (which may be served from a
// different port, e.g. Live Server on 5500) is allowed to call this API.
app.use(cors());

app.use(express.json());

// Simple request logger (helps when testing with Postman).
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// -------------------------------------------------------------
// GET /api/events
// Returns every ACTIVE event with its category and organisation.
// Events whose date has passed are marked as "past"; the client
// uses this flag to show the "Past" / "Upcoming" badge.
// Suspended events are excluded (policy violation => hidden).
// -------------------------------------------------------------
app.get('/api/events', (req, res) => {
    const sql = `
        SELECT e.event_id,
               e.name,
               e.short_description,
               e.event_date,
               e.location,
               e.city,
               e.ticket_price,
               e.fundraising_goal,
               e.funds_raised,
               e.image_url,
               c.name          AS category,
               o.name          AS organisation,
               CASE
                   WHEN e.event_date < CURDATE() THEN 'past'
                   ELSE 'upcoming'
               END             AS event_status
        FROM event e
        JOIN category c     ON e.category_id = c.category_id
        JOIN organisation o ON e.organisation_id = o.organisation_id
        WHERE e.status = 'active'
        ORDER BY (e.event_date >= CURDATE()) DESC, e.event_date ASC;
    `;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error while fetching events.' });
        }
        res.json(rows);
    });
});

// -------------------------------------------------------------
// GET /api/categories
// Returns all event categories (id + name) so the search page
// can build its category dropdown filter.
// -------------------------------------------------------------
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT category_id, name, description FROM category ORDER BY name ASC;';
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error while fetching categories.' });
        }
        res.json(rows);
    });
});

// -------------------------------------------------------------
// GET /api/events/search?date=YYYY-MM-DD&location=text&category=id
// Searches ACTIVE events using one or more criteria (AND logic).
// Any criterion left empty is ignored, so the endpoint supports
// single-criterion and multi-criterion searches.
// -------------------------------------------------------------
app.get('/api/events/search', (req, res) => {
    // Whitelist the allowed query parameters to avoid SQL injection.
    const { date, location, category } = req.query;

    let sql = `
        SELECT e.event_id,
               e.name,
               e.short_description,
               e.event_date,
               e.location,
               e.city,
               e.ticket_price,
               e.fundraising_goal,
               e.funds_raised,
               e.image_url,
               c.name AS category,
               CASE
                   WHEN e.event_date < CURDATE() THEN 'past'
                   ELSE 'upcoming'
               END    AS event_status
        FROM event e
        JOIN category c ON e.category_id = c.category_id
        WHERE e.status = 'active'
    `;
    const params = [];

    if (date) {                       // exact date filter
        sql += ' AND DATE(e.event_date) = ?';
        params.push(date);
    }
    if (location) {                   // partial, case-insensitive location match
        sql += ' AND (e.location LIKE ? OR e.city LIKE ?)';
        const like = `%${location}%`;
        params.push(like, like);
    }
    if (category) {                   // exact category filter
        sql += ' AND e.category_id = ?';
        params.push(Number(category));
    }

    sql += ' ORDER BY e.event_date ASC;';

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error while searching events.' });
        }
        res.json(rows);   // may be an empty array - the client shows a friendly message
    });
});

// -------------------------------------------------------------
// GET /api/events/:id
// Returns the full details of ONE active event (for the event
// detail page). Returns 404 if the event does not exist or is
// suspended, so private/suspended data is never leaked.
// -------------------------------------------------------------
app.get('/api/events/:id', (req, res) => {
    const sql = `
        SELECT e.event_id,
               e.name,
               e.short_description,
               e.full_description,
               e.purpose,
               e.event_date,
               e.location,
               e.city,
               e.ticket_price,
               e.ticket_info,
               e.fundraising_goal,
               e.funds_raised,
               e.image_url,
               e.status,
               c.name AS category,
               o.name AS organisation,
               o.contact_email AS organisation_email,
               CASE
                   WHEN e.event_date < CURDATE() THEN 'past'
                   ELSE 'upcoming'
               END    AS event_status
        FROM event e
        JOIN category c     ON e.category_id = c.category_id
        JOIN organisation o ON e.organisation_id = o.organisation_id
        WHERE e.event_id = ? AND e.status = 'active';
    `;
    db.query(sql, [req.params.id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error while fetching the event.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.json(rows[0]);
    });
});

// Central error handler (unexpected errors become clean JSON, not HTML).
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => {
    console.log(`Charity Events API running at http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log(`  GET http://localhost:${PORT}/api/events`);
    console.log(`  GET http://localhost:${PORT}/api/events/search?date=&location=&category=`);
    console.log(`  GET http://localhost:${PORT}/api/events/:id`);
    console.log(`  GET http://localhost:${PORT}/api/categories`);
});
