-- =============================================================
-- PROG2002 Assessment 2 - Charity Events Database
-- Database: charityevents_db
-- Description: Schema and sample data for the charity events
--              dynamic website (case study, set in Liuzhou, China).
-- How to use (MySQL Workbench / mysql command line):
--   1. Open this file and run it (or: mysql -u root -p < charityevents_db.sql)
--   2. It creates the database, the tables, and sample data.
-- =============================================================

DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db;
USE charityevents_db;

-- -------------------------------------------------------------
-- Table: organisation
-- Stores the charitable organisations that host events.
-- -------------------------------------------------------------
CREATE TABLE organisation (
    organisation_id INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    mission_statement TEXT,
    contact_email   VARCHAR(100),
    contact_phone   VARCHAR(20),
    address         VARCHAR(200)
);

-- -------------------------------------------------------------
-- Table: category
-- Event categories used to filter events (e.g. fun run, gala).
-- -------------------------------------------------------------
CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- -------------------------------------------------------------
-- Table: event
-- Stores every charity event. The status flag allows the site
-- to suspend events that violate policy (suspended events are
-- hidden from the public pages). Whether an event is "past" or
-- "upcoming" is derived by comparing event_date with CURDATE().
-- -------------------------------------------------------------
CREATE TABLE event (
    event_id        INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT NOT NULL,
    category_id     INT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    short_description VARCHAR(255),
    full_description  TEXT,
    purpose         VARCHAR(255),
    event_date      DATETIME NOT NULL,
    location        VARCHAR(150) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    ticket_price    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ticket_info     VARCHAR(255),
    fundraising_goal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    funds_raised    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    image_url       VARCHAR(255),
    status          ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_organisation
        FOREIGN KEY (organisation_id) REFERENCES organisation (organisation_id),
    CONSTRAINT fk_event_category
        FOREIGN KEY (category_id) REFERENCES category (category_id)
);

-- -------------------------------------------------------------
-- Sample data: charitable organisations
-- -------------------------------------------------------------
INSERT INTO organisation (name, description, mission_statement, contact_email, contact_phone, address) VALUES
('Liuzhou Care', 'Liuzhou Care is a local non-profit organisation dedicated to supporting vulnerable families and individuals across Liuzhou through food relief, housing support, and community programs.',
 'No one in Liuzhou should face hardship alone.',
 'hello@liuzhoucare.org', '+86 772 5550 1234', '12 Binjiang East Road, Chengzhong District, Liuzhou, Guangxi'),
('Bright Futures Youth Foundation', 'Bright Futures Youth Foundation empowers young people aged 12-25 in Liuzhou with mentoring, education scholarships, and mental health support so every young person can reach their full potential.',
 'Every young person deserves a bright future.',
 'contact@brightfutures.org', '+86 772 5550 9876', '88 Wenchang Road, Liuzhou, Guangxi');

-- -------------------------------------------------------------
-- Sample data: event categories
-- -------------------------------------------------------------
INSERT INTO category (name, description) VALUES
('Fun Run', 'Running or walking events open to all fitness levels'),
('Gala Dinner', 'Formal fundraising dinners with auctions and entertainment'),
('Concert', 'Live music events raising funds for a cause'),
('Silent Auction', 'Bidding events where attendees place written bids'),
('Charity Walk', 'Community walking events for awareness and fundraising'),
('Bake Sale', 'Community food stalls raising funds for local causes');

-- -------------------------------------------------------------
-- Sample data: events (8+ events, a mix of past and upcoming)
-- Dates are set around late 2026 so that some events show as
-- "past" and others as "upcoming" when the site is marked.
-- -------------------------------------------------------------
INSERT INTO event
(organisation_id, category_id, name, short_description, full_description, purpose,
 event_date, location, city, ticket_price, ticket_info, fundraising_goal, funds_raised, image_url, status) VALUES
-- Organisation 1: Liuzhou Care
(1, 1, 'Liuzhou Riverside Fun Run 2026', 'A 10 km fun run along the scenic Liu River promenade.',
 'Lace up your running shoes and join us for the annual Liuzhou Riverside Fun Run! Choose between the 10 km course for experienced runners or the relaxed 3 km family walk along the Liu River promenade. All proceeds fund our emergency food relief program, which provides over 5,000 food hampers each year to families doing it tough.',
 'Raise CNY 40,000 for the emergency food relief program.',
 '2026-11-08 08:00:00', 'Binjiang Park (Riverside Park), Liuzhou', 'Liuzhou', 35.00,
 'Entry includes a race bib, finisher medal, and breakfast rice noodles.', 40000.00, 26500.00,
 'images/fun-run.jpg', 'active'),

(1, 2, 'Starlight Gala Dinner 2026', 'An elegant evening of fine dining, live music, and a live auction.',
 'Join Liuzhou Care for our most glamorous night of the year. The Starlight Gala Dinner features a three-course meal, performances by local musicians, and a live auction with exclusive prizes. Every ticket helps us keep our family shelter open 24/7 for those experiencing homelessness.',
 'Raise CNY 120,000 for the 24/7 family shelter.',
 '2026-12-05 18:30:00', 'Grand Ballroom, Liuzhou Hotel', 'Liuzhou', 150.00,
 'Black tie. All tickets include dinner, drinks, and auction paddle.', 120000.00, 74500.00,
 'images/gala-dinner.jpg', 'active'),

(1, 6, 'Community Bake Sale & Morning Tea', 'Homemade treats, great coffee, and even better company.',
 'Our wonderful volunteers bake hundreds of cakes, luosifen-inspired snacks, slices, and biscuits for this beloved community morning tea. Drop by, grab a coffee and a treat, and know that every yuan goes straight to our senior companionship program, which pairs volunteers with isolated elderly residents.',
 'Raise CNY 5,000 for the senior companionship program.',
 '2026-10-18 09:00:00', 'Liuzhou Community Hall, Chengzhong District', 'Liuzhou', 0.00,
 'Free entry - pay what you feel for treats and coffee.', 5000.00, 1300.00,
 'images/bake-sale.jpg', 'active'),

(1, 5, 'Sunrise Charity Walk for Seniors', 'A gentle 5 km walk at sunrise to honour our elderly community.',
 'Walk with us at sunrise around the lakeside trail of Dalongtan Park to raise awareness of loneliness among seniors. The 5 km route is fully accessible, and the early morning air in the park is unforgettable. Funds raised keep our weekly social visits and transport service running.',
 'Raise CNY 15,000 for senior social support services.',
 '2026-08-23 06:30:00', 'Lakeside Trail, Dalongtan Park, Liuzhou', 'Liuzhou', 20.00,
 'Includes breakfast roll and soy milk at the finish line.', 15000.00, 15230.00,
 'images/charity-walk.jpg', 'active'),

-- Organisation 2: Bright Futures Youth Foundation
(2, 3, 'Sounds of Tomorrow Benefit Concert', 'An afternoon of live music by young Liuzhou artists.',
 'Some of Liuzhou''s most talented young musicians take the stage for one unforgettable afternoon by the river at Yaobu Ancient Town. Every ticket funds our music scholarship program, giving disadvantaged young people instruments, lessons, and a stage of their own. Line-up announced soon!',
 'Raise CNY 30,000 for youth music scholarships.',
 '2026-11-21 14:00:00', 'Riverside Amphitheatre, Yaobu Ancient Town', 'Liuzhou', 45.00,
 'General admission. Under 12s free with a paying adult.', 30000.00, 9800.00,
 'images/benefit-concert.jpg', 'active'),

(2, 1, 'Bright Futures Colour Dash', 'A 5 km colour run where getting messy is the whole point!',
 'The Colour Dash is back! Run, walk, or dance your way through 5 km of colour stations at People''s Square while our volunteers shower you in bright, non-toxic powder. Perfect for families, teams, and anyone who wants to support youth mental health programs in the most colourful way possible.',
 'Raise CNY 25,000 for youth mental health programs.',
 '2026-10-25 09:30:00', 'People''s Square, Liuzhou', 'Liuzhou', 30.00,
 'Entry includes colour pack, sunglasses, and event t-shirt.', 25000.00, 6200.00,
 'images/colour-dash.jpg', 'active'),

(2, 4, 'Young Artists Silent Auction', 'Bid on artworks donated by emerging young Liuzhou artists.',
 'Browse and bid on over 60 original artworks donated by Liuzhou''s most promising young artists, from ink paintings and photography to ceramics and digital art. All hammer prices go directly to our education scholarship fund, helping young people stay in school.',
 'Raise CNY 18,000 for the education scholarship fund.',
 '2026-12-12 17:00:00', 'Exhibition Hall, Liuzhou Museum', 'Liuzhou', 10.00,
 'Entry fee covers catalogue and refreshments. Bidding paddles provided.', 18000.00, 0.00,
 'images/silent-auction.jpg', 'active'),

(2, 2, 'Golden Hour Gala 2026', 'Celebrate a decade of bright futures at our anniversary gala.',
 'Ten years of mentoring, scholarships, and second chances - and we are just getting started. Join us for a night of celebration on the rooftop of the Diwang International Tower with guest speakers, a retrospective exhibition, and a fundraising pledge drive to launch our next decade of impact.',
 'Raise CNY 200,000 for the next decade of youth programs.',
 '2026-09-12 18:00:00', 'Rooftop Garden, Diwang International Tower, CBD', 'Liuzhou', 200.00,
 'Cocktail attire. Includes canapes, drinks, and entertainment.', 200000.00, 201500.00,
 'images/golden-gala.jpg', 'active'),

-- A suspended event (violates policy - must NOT appear on the website)
(2, 3, 'Test Event - Suspended', 'This event has been suspended and should never be displayed.',
 'This placeholder event exists to demonstrate that suspended events are hidden from the public website. It violates our content policy and therefore its status is set to suspended.',
 'N/A - suspended event.',
 '2026-11-15 19:00:00', 'Secret Location', 'Liuzhou', 10.00,
 'N/A', 1000.00, 0.00, NULL, 'suspended');
