-- =============================
-- V8__seed_data.sql  (corrected)
-- =============================
-- Passwords:
--   u3  (admin@example.com)  → admin123
--   all others               → password123
--
-- Project statuses:
--   COMPLETED  → p1, p4, p7, p12, p16            (5)
--   IN_PROGRESS→ p2, p3, p5, p6, p8, p9,
--                p10, p11, p14, p15               (10)
--   OPEN       → p13, p17, p18, p19, p20          (5)
--
-- Bid statuses:
--   ACCEPTED   → winning bid per contracted project
--   REJECTED   → all other bids on a contracted project
--   PENDING    → bids on OPEN projects (p13, p17, p18, p19, p20)
--
-- Contracts: 15 total
--   COMPLETED  → c1, c4, c7, c12, c15
--   ACTIVE     → c2, c3, c5, c6, c8, c9, c10, c11, c13, c14
--
-- Milestones:
--   COMPLETED contracts → both milestones APPROVED
--   ACTIVE contracts    → first APPROVED, second PENDING
--
-- Reviews: both parties review each COMPLETED contract (10 reviews)
-- =============================

-- ─── USERS ────────────────────────────────────────────────────────────────────
INSERT INTO users (id, name, email, password, phone, role, active, created_at, updated_at) VALUES
('u1',  'Alice Smith',   'alice@example.com',  '$2b$10$guhTnFkt0Vkvn58BTbCfNu8MRVlQqeBQ11EyUNr7jVWtj7ky6vrYW', '+212600000001', 'CLIENT',     true, now(), now()),
('u2',  'Bob Jones',     'bob@example.com',    '$2b$10$ydHQHY4X9rjPtg2dHl0xCOxtEc3fPMKiHI612x7pR00hNvwvil4Py', '+212600000002', 'FREELANCER', true, now(), now()),
('u3',  'Charlie Admin', 'admin@example.com',  '$2b$10$fNHGYCXrlViRjW3EIqvuiOG4o0uC/MBjeG5xXWTXT/DwUmvniSeBu', '+212600000003', 'ADMIN',      true, now(), now()),
('u4',  'David Lee',     'david@example.com',  '$2b$10$SnOS/NOt6e.aYi8zLYaydeakWEno3qiaHjPAKeMmDxHK2rf0JlX/u', '+212600000004', 'CLIENT',     true, now(), now()),
('u5',  'Eve Martinez',  'eve@example.com',    '$2b$10$yQEy/JHRhDtMOwc6Q2CCfuO9qKzL.FF4AqdL.spfc/VAUedFWmfIu', '+212600000005', 'CLIENT',     true, now(), now()),
('u6',  'Frank White',   'frank@example.com',  '$2b$10$L2jz/Ga77oFLxjUDRwkgTuXpelaWaE3bgUbXR1M5SooHIyOM.K7CG', '+212600000006', 'FREELANCER', true, now(), now()),
('u7',  'Grace Kim',     'grace@example.com',  '$2b$10$72i.lOiiW8TEWL5gFf8tsONTSildv0rzJiUr/ptFotMxAUPJzWuvi', '+212600000007', 'FREELANCER', true, now(), now()),
('u8',  'Hector Diaz',   'hector@example.com', '$2b$10$pPhk2QTYFFLXh7gOgSFRRegXzVFq5t7QcDYi5IK7vFXcEaVaGiGta', '+212600000008', 'FREELANCER', true, now(), now()),
('u9',  'Ivy Chen',      'ivy@example.com',    '$2b$10$wN6nKu0.b7jqgUpGiSz7JeT0IHwMnB0xT.7yjqK2RTxsXg/Y/sfN6', '+212600000009', 'FREELANCER', true, now(), now()),
('u10', 'Jack Black',    'jack@example.com',   '$2b$10$yeZ6gNnymJRYXVp6K9IIkehXDsafSJ...Z5Z8n2b0VYlyQUyuutyS', '+212600000010', 'FREELANCER', true, now(), now()),
('u11', 'Lara Croft',    'lara@example.com',   '$2b$10$VxRg1o3hO.9HiM5avrUqG.Y.TP.sDW0eafY5kfZNMzGtdtf.RSP4i', '+212600000011', 'CLIENT',     true, now(), now()),
('u12', 'Mike Ross',     'mike@example.com',   '$2b$10$vw6A1UTXplyvNH6G78X2WOsRey/.aGcsbR7jDbzPvbriQdbjdkqVe', '+212600000012', 'FREELANCER', true, now(), now());

-- ─── ADMINS ───────────────────────────────────────────────────────────────────
INSERT INTO admins (id) VALUES ('u3');

-- ─── CLIENTS ──────────────────────────────────────────────────────────────────
INSERT INTO clients (id, company_name, company_description, website, rating) VALUES
('u1',  'TechCorp',  'Leading technology company',     'https://techcorp.com',  4.5),
('u4',  'Designify', 'Creative design studio',         'https://designify.com', 4.3),
('u5',  'BuildIt',   'Construction solutions',         'https://buildit.com',   4.0),
('u11', 'MarketPro', 'Marketing & advertising agency', 'https://marketpro.com', 4.2);

-- ─── FREELANCERS ──────────────────────────────────────────────────────────────
INSERT INTO freelancers (id, bio, hourly_rate, profile_picture, rating) VALUES
('u2',  'Full-stack developer with 5 years experience',     35.0, null, 4.8),
('u6',  'Front-end developer expert in React and Tailwind', 30.0, null, 4.6),
('u7',  'Back-end developer with Node.js and Spring Boot',  40.0, null, 4.9),
('u8',  'Mobile app developer (iOS & Android)',             32.0, null, 4.5),
('u9',  'Data scientist & ML engineer',                     45.0, null, 4.7),
('u10', 'DevOps engineer, Docker & Kubernetes',             38.0, null, 4.6),
('u12', 'Full-stack MERN developer',                        33.0, null, 4.4);

-- ─── FREELANCER SKILLS ────────────────────────────────────────────────────────
INSERT INTO freelancer_skills (freelancer_id, skill) VALUES
('u2',  'React'),            ('u2',  'Node.js'),          ('u2',  'PostgreSQL'),
('u6',  'React'),            ('u6',  'Tailwind'),          ('u6',  'Next.js'),
('u7',  'Node.js'),          ('u7',  'Spring Boot'),       ('u7',  'PostgreSQL'),
('u8',  'Flutter'),          ('u8',  'iOS'),               ('u8',  'Android'),
('u9',  'Python'),           ('u9',  'Machine Learning'),  ('u9',  'Pandas'),
('u10', 'Docker'),           ('u10', 'Kubernetes'),        ('u10', 'CI/CD'),
('u12', 'MongoDB'),          ('u12', 'Express'),           ('u12', 'React');

-- ─── PROJECTS ─────────────────────────────────────────────────────────────────
-- COMPLETED: p1, p4, p7, p12, p16
-- IN_PROGRESS: p2, p3, p5, p6, p8, p9, p10, p11, p14, p15
-- OPEN: p13, p17, p18, p19, p20
INSERT INTO projects (id, title, description, budget_min, budget_max, status, category, deadline, client_id, created_at) VALUES
('p1',  'Website Redesign',       'Redesign company website',            1000,  3000, 'COMPLETED',   'WEB_DEV',   '2026-06-30', 'u1',  now()),
('p2',  'Mobile App Development', 'Build iOS/Android app',               5000, 10000, 'IN_PROGRESS', 'MOBILE',    '2026-07-15', 'u1',  now()),
('p3',  'E-commerce Platform',    'Develop e-commerce website',          2000,  6000, 'IN_PROGRESS', 'WEB_DEV',   '2026-08-01', 'u4',  now()),
('p4',  'Marketing Website',      'Landing page for marketing campaign',  500,  1500, 'COMPLETED',   'WEB_DEV',   '2026-06-20', 'u5',  now()),
('p5',  'Social Media App',       'App for social interactions',         4000,  9000, 'IN_PROGRESS', 'MOBILE',    '2026-07-30', 'u11', now()),
('p6',  'CRM Integration',        'Integrate CRM with website',          1500,  4000, 'IN_PROGRESS', 'WEB_DEV',   '2026-06-25', 'u1',  now()),
('p7',  'Logo Design',            'Design a new logo',                    200,   500, 'COMPLETED',   'DESIGN',    '2026-06-18', 'u5',  now()),
('p8',  'SEO Optimization',       'SEO for website',                     1000,  2000, 'IN_PROGRESS', 'MARKETING', '2026-06-30', 'u4',  now()),
('p9',  'Blog Platform',          'Create a blog platform',               800,  2500, 'IN_PROGRESS', 'WEB_DEV',   '2026-07-05', 'u11', now()),
('p10', 'Payment Gateway',        'Integrate Stripe/PayPal',             1200,  3500, 'IN_PROGRESS', 'WEB_DEV',   '2026-07-10', 'u1',  now()),
('p11', 'Inventory System',       'Warehouse management system',         3000,  7000, 'IN_PROGRESS', 'WEB_DEV',   '2026-07-20', 'u4',  now()),
('p12', 'Portfolio Website',      'Build personal portfolio site',        500,  1500, 'COMPLETED',   'WEB_DEV',   '2026-06-28', 'u5',  now()),
('p13', 'Landing Page',           'Marketing landing page',               400,  1200, 'OPEN',        'WEB_DEV',   '2026-06-22', 'u1',  now()),
('p14', 'Chatbot Development',    'AI chatbot for website',              2000,  5000, 'IN_PROGRESS', 'OTHER',     '2026-07-01', 'u11', now()),
('p15', 'Data Dashboard',         'Analytics dashboard',                 2500,  6000, 'IN_PROGRESS', 'WEB_DEV',   '2026-07-12', 'u4',  now()),
('p16', 'Email Campaign',         'Email marketing campaign',             300,   900, 'COMPLETED',   'MARKETING', '2026-06-29', 'u5',  now()),
('p17', 'Mobile Game',            'Develop mobile game',                 4000,  8000, 'OPEN',        'MOBILE',    '2026-07-25', 'u1',  now()),
('p18', 'UX/UI Audit',            'Audit UX/UI of platform',              500,  1500, 'OPEN',        'DESIGN',    '2026-06-27', 'u11', now()),
('p19', 'Database Migration',     'Migrate legacy database',             1500,  4000, 'OPEN',        'WEB_DEV',   '2026-07-03', 'u4',  now()),
('p20', 'Social Media Ads',       'Social ads campaign',                 1000,  2500, 'OPEN',        'MARKETING', '2026-06-26', 'u5',  now());

-- ─── PROJECT SKILLS ───────────────────────────────────────────────────────────
INSERT INTO project_skills (project_id, skill) VALUES
('p1',  'React'),          ('p1',  'Tailwind'),
('p2',  'Flutter'),        ('p2',  'Firebase'),
('p3',  'Shopify'),        ('p3',  'React'),
('p4',  'HTML'),           ('p4',  'CSS'),
('p5',  'React Native'),   ('p5',  'Firebase'),
('p6',  'CRM'),            ('p6',  'Node.js'),
('p7',  'Illustrator'),    ('p7',  'Photoshop'),
('p8',  'SEO'),            ('p8',  'Google Analytics'),
('p9',  'WordPress'),      ('p9',  'CSS'),
('p10', 'Stripe'),         ('p10', 'PayPal'),
('p11', 'Java'),           ('p11', 'Spring Boot'),
('p12', 'React'),          ('p12', 'Tailwind'),
('p13', 'HTML'),           ('p13', 'CSS'),
('p14', 'Python'),         ('p14', 'AI'),
('p15', 'React'),          ('p15', 'D3.js'),
('p16', 'Mailchimp'),      ('p16', 'HTML'),
('p17', 'Unity'),          ('p17', 'C#'),
('p18', 'Figma'),          ('p18', 'UX'),
('p19', 'PostgreSQL'),     ('p19', 'Node.js'),
('p20', 'Facebook Ads'),   ('p20', 'Instagram Ads');

-- ─── BIDS ─────────────────────────────────────────────────────────────────────
-- Rules:
--   ACCEPTED → winning bid (one per contracted project)
--   REJECTED → all other bids on a contracted project
--   PENDING  → bids on OPEN projects (p13, p17, p18, p19, p20)
--
-- Contracted projects and their winners:
--   p1  → b1  (u2)     p2  → b3  (u7)     p3  → b5  (u7)
--   p4  → b7  (u6)     p5  → b9  (u12)    p6  → b10 (u9)
--   p7  → b11 (u2)     p8  → b12 (u6)     p9  → b13 (u7)
--   p10 → b14 (u12)    p11 → b15 (u10)    p12 → b16 (u2)
--   p14 → b18 (u7)     p15 → b19 (u9)     p16 → b20 (u12)
INSERT INTO bids (id, freelancer_id, project_id, proposed_price, cover_letter, estimated_days, status, submitted_at) VALUES
-- p1 (COMPLETED) — winner: b1
('b1',  'u2',  'p1',  2500, 'I can redesign your website quickly.',       10, 'ACCEPTED', now()),
('b2',  'u6',  'p1',  2600, 'Experienced in React and Tailwind.',          12, 'REJECTED', now()),
-- p2 (IN_PROGRESS) — winner: b3
('b3',  'u7',  'p2',  9000, 'Mobile app expert with Spring Boot backend.', 20, 'ACCEPTED', now()),
('b4',  'u8',  'p2',  9500, 'Flutter and iOS/Android specialist.',         22, 'REJECTED', now()),
('b26', 'u2',  'p2',  8800, 'Quick mobile app delivery.',                  15, 'REJECTED', now()),
-- p3 (IN_PROGRESS) — winner: b5
('b5',  'u7',  'p3',  5500, 'E-commerce platform specialist.',             15, 'ACCEPTED', now()),
('b6',  'u2',  'p3',  5200, 'Experienced in Shopify and React.',           16, 'REJECTED', now()),
('b27', 'u6',  'p3',  5600, 'E-commerce expert in React/Tailwind.',        16, 'REJECTED', now()),
-- p4 (COMPLETED) — winner: b7
('b7',  'u6',  'p4',  1400, 'Marketing website and landing pages.',        10, 'ACCEPTED', now()),
('b28', 'u8',  'p4',  1450, 'Marketing pages with clean design.',          12, 'REJECTED', now()),
-- p5 (IN_PROGRESS) — winner: b9
('b8',  'u8',  'p5',  4200, 'Social media app development.',               18, 'REJECTED', now()),
('b9',  'u12', 'p5',  4500, 'Full-stack MERN developer.',                  20, 'ACCEPTED', now()),
('b29', 'u7',  'p5',  4300, 'Social app full-stack with Spring Boot.',     20, 'REJECTED', now()),
('b45', 'u2',  'p5',  4300, 'React Native app development.',               18, 'REJECTED', now()),
-- p6 (IN_PROGRESS) — winner: b10
('b10', 'u9',  'p6',  3800, 'CRM integration expert.',                     12, 'ACCEPTED', now()),
('b30', 'u12', 'p6',  3900, 'CRM integration with MERN stack.',            14, 'REJECTED', now()),
('b46', 'u6',  'p6',  3850, 'CRM integration with React frontend.',        12, 'REJECTED', now()),
-- p7 (COMPLETED) — winner: b11
('b11', 'u2',  'p7',   400, 'Logo design in Illustrator and Photoshop.',    5, 'ACCEPTED', now()),
('b31', 'u10', 'p7',   480, 'Logo design with brand guidelines.',           6, 'REJECTED', now()),
('b47', 'u7',  'p7',   480, 'Clean minimalist logo design.',                5, 'REJECTED', now()),
-- p8 (IN_PROGRESS) — winner: b12
('b12', 'u6',  'p8',  1800, 'SEO optimization specialist.',                 8, 'ACCEPTED', now()),
('b32', 'u2',  'p8',  1700, 'SEO and analytics expert.',                    8, 'REJECTED', now()),
('b48', 'u8',  'p8',  1850, 'SEO and Google Analytics.',                    8, 'REJECTED', now()),
-- p9 (IN_PROGRESS) — winner: b13
('b13', 'u7',  'p9',  2200, 'Blog platform with WordPress and REST API.',  12, 'ACCEPTED', now()),
('b33', 'u6',  'p9',  2300, 'Blog development with React frontend.',       12, 'REJECTED', now()),
('b49', 'u9',  'p9',  2250, 'Blog and CMS development.',                   12, 'REJECTED', now()),
-- p10 (IN_PROGRESS) — winner: b14
('b14', 'u12', 'p10', 3200, 'Payment gateway integration specialist.',     10, 'ACCEPTED', now()),
('b34', 'u7',  'p10', 3100, 'Payment integration with Spring Boot.',       10, 'REJECTED', now()),
-- p11 (IN_PROGRESS) — winner: b15
('b15', 'u10', 'p11', 6800, 'Inventory system with Docker and Kubernetes.',25, 'ACCEPTED', now()),
('b35', 'u8',  'p11', 6900, 'Inventory expert with mobile integration.',   26, 'REJECTED', now()),
('b50', 'u12', 'p11', 3150, 'Inventory system backend with Node.js.',      10, 'REJECTED', now()),
-- p12 (COMPLETED) — winner: b16
('b16', 'u2',  'p12', 1200, 'Portfolio website with React and Tailwind.',   6, 'ACCEPTED', now()),
('b36', 'u9',  'p12', 1300, 'Portfolio developer with animations.',         6, 'REJECTED', now()),
-- p13 (OPEN) — all PENDING
('b17', 'u6',  'p13', 1000, 'Landing page development with HTML/CSS.',      5, 'PENDING',  now()),
('b37', 'u12', 'p13', 1050, 'Landing page with clean modern design.',       5, 'PENDING',  now()),
-- p14 (IN_PROGRESS) — winner: b18
('b18', 'u7',  'p14', 4500, 'AI chatbot specialist with Python backend.',  18, 'ACCEPTED', now()),
('b38', 'u2',  'p14', 4600, 'AI chatbot developer with Node.js.',          18, 'REJECTED', now()),
('b41', 'u8',  'p14', 4350, 'AI chatbot with mobile integration.',         17, 'REJECTED', now()),
-- p15 (IN_PROGRESS) — winner: b19
('b19', 'u9',  'p15', 5000, 'Data dashboard with Python and D3.js.',       20, 'ACCEPTED', now()),
('b39', 'u6',  'p15', 5200, 'Data dashboard with React and D3.',           20, 'REJECTED', now()),
-- p16 (COMPLETED) — winner: b20
('b20', 'u12', 'p16',  800, 'Email campaign developer with Mailchimp.',     4, 'ACCEPTED', now()),
('b40', 'u7',  'p16',  850, 'Email campaign with automation setup.',        4, 'REJECTED', now()),
-- p17 (OPEN) — all PENDING
('b21', 'u2',  'p17', 4200, 'Mobile game developer with Unity experience.',22, 'PENDING',  now()),
('b22', 'u8',  'p17', 4500, 'Unity and C# game developer.',                25, 'PENDING',  now()),
-- p18 (OPEN) — all PENDING
('b23', 'u6',  'p18', 1300, 'UX/UI audit with Figma deliverables.',         6, 'PENDING',  now()),
('b42', 'u9',  'p18', 1350, 'UX/UI audit with research report.',            6, 'PENDING',  now()),
-- p19 (OPEN) — all PENDING
('b24', 'u7',  'p19', 3700, 'Database migration with zero downtime.',      12, 'PENDING',  now()),
('b43', 'u12', 'p19', 3800, 'Database migration with full backup plan.',   12, 'PENDING',  now()),
-- p20 (OPEN) — all PENDING
('b25', 'u9',  'p20', 2100, 'Social media ads campaign specialist.',        8, 'PENDING',  now()),
('b44', 'u10', 'p20', 2200, 'Social ads with performance tracking.',        8, 'PENDING',  now());

-- ─── CONTRACTS ────────────────────────────────────────────────────────────────
-- COMPLETED: c1 (p1), c4 (p4), c7 (p7), c12 (p12), c15 (p16)
-- ACTIVE:    c2 (p2), c3 (p3), c5 (p5), c6 (p6), c8 (p8),
--            c9 (p9), c10 (p10), c11 (p11), c13 (p14), c14 (p15)
INSERT INTO contracts (id, bid_id, status, agreed_price, start_date, end_date, created_at) VALUES
('c1',  'b1',  'COMPLETED', 2500, '2026-02-01', '2026-02-15', now()),
('c2',  'b3',  'ACTIVE',    9000, '2026-04-10', '2026-04-30', now()),
('c3',  'b5',  'ACTIVE',    5500, '2026-05-01', '2026-05-20', now()),
('c4',  'b7',  'COMPLETED', 1400, '2026-02-05', '2026-02-15', now()),
('c5',  'b9',  'ACTIVE',    4500, '2026-04-12', '2026-05-01', now()),
('c6',  'b10', 'ACTIVE',    3800, '2026-04-14', '2026-05-06', now()),
('c7',  'b11', 'COMPLETED',  400, '2026-02-02', '2026-02-04', now()),
('c8',  'b12', 'ACTIVE',    1800, '2026-04-06', '2026-04-14', now()),
('c9',  'b13', 'ACTIVE',    2200, '2026-04-08', '2026-04-20', now()),
('c10', 'b14', 'ACTIVE',    3200, '2026-04-15', '2026-05-07', now()),
('c11', 'b15', 'ACTIVE',    6800, '2026-04-10', '2026-05-05', now()),
('c12', 'b16', 'COMPLETED', 1200, '2026-02-03', '2026-02-09', now()),
('c13', 'b18', 'ACTIVE',    4500, '2026-04-12', '2026-04-30', now()),
('c14', 'b19', 'ACTIVE',    5000, '2026-04-14', '2026-05-05', now()),
('c15', 'b20', 'COMPLETED',  800, '2026-02-10', '2026-02-14', now());

-- ─── MILESTONES ───────────────────────────────────────────────────────────────
-- COMPLETED contracts (c1, c4, c7, c12, c15) → both milestones APPROVED
-- ACTIVE contracts                             → first APPROVED, second PENDING
INSERT INTO milestones (id, contract_id, title, description, amount, status, due_date, deliverable_url) VALUES
-- c1 COMPLETED
('m1',  'c1',  'Design Mockups',      'Homepage and inner page mockups',        1000, 'APPROVED', '2026-02-05', 'https://figma.com/mockups-p1'),
('m2',  'c1',  'Final Website',       'Full website delivered and deployed',     1500, 'APPROVED', '2026-02-15', 'https://github.com/final-p1'),
-- c2 ACTIVE
('m3',  'c2',  'App Core Features',   'Main screens and navigation done',        5000, 'APPROVED', '2026-04-20', 'https://github.com/app-core-p2'),
('m4',  'c2',  'App Final Delivery',  'Full app with tests and App Store build', 4000, 'PENDING',  '2026-04-30', null),
-- c3 ACTIVE
('m5',  'c3',  'E-comm Setup',        'Shopify store and product pages',         2500, 'APPROVED', '2026-05-10', 'https://github.com/ecomm-setup'),
('m6',  'c3',  'E-comm Launch',       'Final delivery, QA and launch',           3000, 'PENDING',  '2026-05-20', null),
-- c4 COMPLETED
('m7',  'c4',  'Landing Draft',       'Initial draft and client feedback round',  600, 'APPROVED', '2026-02-10', 'https://figma.com/landing-draft'),
('m8',  'c4',  'Landing Final',       'Final responsive landing page',            800, 'APPROVED', '2026-02-15', 'https://github.com/final-p4'),
-- c5 ACTIVE
('m9',  'c5',  'App Wireframes',      'Social app wireframes and UX flow',       1500, 'APPROVED', '2026-04-18', 'https://figma.com/social-wireframes'),
('m10', 'c5',  'App Development',     'Full app development and testing',        3000, 'PENDING',  '2026-05-01', null),
-- c6 ACTIVE
('m11', 'c6',  'CRM Analysis',        'Integration analysis and API mapping',    1500, 'APPROVED', '2026-04-20', 'https://docs.google.com/crm-analysis'),
('m12', 'c6',  'CRM Integration',     'Full CRM integration and testing',        2300, 'PENDING',  '2026-05-06', null),
-- c7 COMPLETED
('m13', 'c7',  'Logo Concepts',       '3 logo concept variations',                200, 'APPROVED', '2026-02-03', 'https://figma.com/logo-concepts'),
('m14', 'c7',  'Logo Final Files',    'Final logo in all formats (SVG, PNG)',     200, 'APPROVED', '2026-02-04', 'https://drive.google.com/logo-final'),
-- c8 ACTIVE
('m15', 'c8',  'SEO Audit',           'Full technical and on-page SEO audit',     800, 'APPROVED', '2026-04-10', 'https://docs.google.com/seo-audit'),
('m16', 'c8',  'SEO Implementation',  'On-page fixes and content optimisation',  1000, 'PENDING',  '2026-04-14', null),
-- c9 ACTIVE
('m17', 'c9',  'Blog Setup',          'WordPress install, theme and plugins',    1000, 'APPROVED', '2026-04-14', 'https://github.com/blog-setup'),
('m18', 'c9',  'Blog Launch',         'Full blog with sample posts and SEO',     1200, 'PENDING',  '2026-04-20', null),
-- c10 ACTIVE
('m19', 'c10', 'Payment Design',      'Payment flow design and sandbox testing', 1400, 'APPROVED', '2026-04-22', 'https://github.com/payment-design'),
('m20', 'c10', 'Payment Integration', 'Live Stripe/PayPal integration',          1800, 'PENDING',  '2026-05-07', null),
-- c11 ACTIVE
('m21', 'c11', 'System Architecture', 'DB schema and system architecture doc',   2000, 'APPROVED', '2026-04-20', 'https://docs.google.com/arch-p11'),
('m22', 'c11', 'System Delivery',     'Full inventory system with Docker setup', 4800, 'PENDING',  '2026-05-05', null),
-- c12 COMPLETED
('m23', 'c12', 'Portfolio Draft',     'Initial design and content layout',        500, 'APPROVED', '2026-02-06', 'https://figma.com/portfolio-draft'),
('m24', 'c12', 'Portfolio Final',     'Deployed portfolio with all sections',     700, 'APPROVED', '2026-02-09', 'https://github.com/portfolio-final'),
-- c13 ACTIVE
('m25', 'c13', 'Chatbot Design',      'Conversation flow and intent mapping',    1500, 'APPROVED', '2026-04-20', 'https://docs.google.com/chatbot-flow'),
('m26', 'c13', 'Chatbot Delivery',    'Integrated and tested chatbot widget',    3000, 'PENDING',  '2026-04-30', null),
-- c14 ACTIVE
('m27', 'c14', 'Dashboard Design',    'Dashboard UI/UX design in Figma',         2000, 'APPROVED', '2026-04-22', 'https://figma.com/dashboard-design'),
('m28', 'c14', 'Dashboard Delivery',  'Full dashboard with live data charts',    3000, 'PENDING',  '2026-05-05', null),
-- c15 COMPLETED
('m29', 'c15', 'Campaign Setup',      'Mailchimp list setup and template',        400, 'APPROVED', '2026-02-12', 'https://mailchimp.com/campaign-setup'),
('m30', 'c15', 'Campaign Delivery',   'Campaign sent with analytics report',      400, 'APPROVED', '2026-02-14', 'https://docs.google.com/campaign-report');

-- ─── REVIEWS ──────────────────────────────────────────────────────────────────
-- Only on COMPLETED contracts: c1, c4, c7, c12, c15
-- Both parties review each other (client→freelancer and freelancer→client)
--
-- c1:  u1 (client, p1) ↔ u2 (freelancer, b1)
-- c4:  u5 (client, p4) ↔ u6 (freelancer, b7)
-- c7:  u5 (client, p7) ↔ u2 (freelancer, b11)
-- c12: u5 (client, p12) ↔ u2 (freelancer, b16)
-- c15: u5 (client, p16) ↔ u12 (freelancer, b20)
INSERT INTO reviews (id, contract_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES
('r1',  'c1',  'u1',  'u2',  5, 'Bob delivered an outstanding website redesign. Fast, clean and pixel perfect.', now()),
('r2',  'c1',  'u2',  'u1',  5, 'Alice was very clear with requirements and gave prompt feedback. Great client.', now()),
('r3',  'c4',  'u5',  'u6',  5, 'Frank nailed the landing page on the first draft. Highly recommended.', now()),
('r4',  'c4',  'u6',  'u5',  4, 'Eve had clear briefs and paid on time. Slight scope changes mid-project.', now()),
('r5',  'c7',  'u5',  'u2',  5, 'Bob designed a beautiful logo that perfectly captured our brand identity.', now()),
('r6',  'c7',  'u2',  'u5',  5, 'Eve was a pleasure to work with. Clear vision and decisive feedback.', now()),
('r7',  'c12', 'u5',  'u2',  5, 'Bob built a stunning portfolio site. Delivered ahead of schedule.', now()),
('r8',  'c12', 'u2',  'u5',  4, 'Good client with clear requirements. Minor revision requests were reasonable.', now()),
('r9',  'c15', 'u5',  'u12', 4, 'Mike set up the email campaign well. Good reporting but took an extra day.', now()),
('r10', 'c15', 'u12', 'u5',  5, 'Eve provided all assets upfront and approved quickly. Smooth project.', now());