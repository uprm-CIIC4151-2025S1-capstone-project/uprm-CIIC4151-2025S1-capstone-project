-- Drop tables in correct order to handle foreign key dependencies
DROP TABLE IF EXISTS report_ratings;

DROP TABLE IF EXISTS pinned_reports;

DROP TABLE IF EXISTS department_admins;

DROP TABLE IF EXISTS reports;

DROP TABLE IF EXISTS administrators;

DROP TABLE IF EXISTS location;

DROP TABLE IF EXISTS verifications;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS admin_codes;

-- Users table with suspended and pinned attributes
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    PASSWORD VARCHAR(255) NOT NULL,
    ADMIN BOOLEAN DEFAULT FALSE,
    suspended BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    total_reports INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification table
CREATE TABLE verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Administrators table (extended user info for admins)
CREATE TABLE administrators (
    id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    department VARCHAR CHECK (
        department IN ('DTOP', 'LUMA', 'AAA', 'DDS')
    ) NOT NULL
);

-- Location table
CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    address TEXT,
    country VARCHAR(100)
);

-- Reports table with category
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) CHECK (
        status IN (
            'resolved',
            'denied',
            'in_progress',
            'open',
            'closed'
        )
    ) DEFAULT 'open',
    category VARCHAR(50) CHECK (
        category IN (
            'pothole',
            'street_light',
            'traffic_signal',
            'road_damage',
            'sanitation',
            'flooding',
            'water_outage',
            'wandering_waste',
            'electrical_hazard',
            'sinkhole',
            'fallen_tree',
            'pipe_leak',
            'other'
        )
    ) DEFAULT 'other',
    created_by INTEGER REFERENCES users (id) NOT NULL,
    validated_by INTEGER REFERENCES administrators (id),
    resolved_by INTEGER REFERENCES administrators (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    location INTEGER REFERENCES location (id),
    city VARCHAR(100),
    image_url VARCHAR,
    rating INTEGER DEFAULT 0
);

-- Department admins junction table
CREATE TABLE department_admins (
    department VARCHAR PRIMARY KEY CHECK (
        department IN ('DTOP', 'LUMA', 'AAA', 'DDS')
    ) NOT NULL,
    admin_id INTEGER REFERENCES administrators (id)
);

-- Pinned reports junction table
CREATE TABLE pinned_reports (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES reports (id) ON DELETE CASCADE,
    pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- not used
    PRIMARY KEY (user_id, report_id)
);

-- Admin codes for user promotion
CREATE TABLE admin_codes (
    code VARCHAR PRIMARY KEY,
    department VARCHAR NOT NULL CHECK (
        department IN ('DTOP', 'LUMA', 'AAA', 'DDS')
    )
);

CREATE TABLE report_ratings (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (report_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_admin ON users (ADMIN);

CREATE INDEX idx_reports_status ON reports (status);

CREATE INDEX idx_reports_category ON reports (category);

CREATE INDEX idx_reports_created_by ON reports (created_by);

CREATE INDEX idx_reports_created_at ON reports (created_at);

CREATE INDEX idx_administrators_department ON administrators (department);

CREATE INDEX idx_pinned_reports_user_id ON pinned_reports (user_id);

CREATE INDEX idx_pinned_reports_report_id ON pinned_reports (report_id);

-- Insert admin codes for user promotion
INSERT INTO
    admin_codes (code, department)
VALUES ('DTOP123', 'DTOP'),
    ('LUMA456', 'LUMA'),
    ('AAA789', 'AAA'),
    ('DDS012', 'DDS');

-- Insert 50 users from Puerto Rico
INSERT INTO
    users (
        email,
        PASSWORD,
        ADMIN,
        suspended,
        pinned
    )
VALUES (
        'juan.martinez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'maria.garcia@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'carlos.rodriguez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'ana.hernandez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'jose.lopez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'laura.gonzalez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'miguel.perez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'isabel.torres@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'rafael.diaz@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'elena.ramirez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'pedro.cruz@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'carmen.reyes@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'antonio.morales@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'patricia.ortiz@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'roberto.vargas@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'sandra.mendoza@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'fernando.guzman@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'gloria.santos@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'ricardo.castro@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'vanessa.rivera@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'oscar.mendez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'adriana.medina@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'manuel.aguilar@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'luz.figueroa@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'victor.rosario@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'diana.santiago@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'alejandro.delgado@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'monica.nazario@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'eduardo.vega@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'irene.colon@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'raul.serrano@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'teresa.miranda@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'hugo.rojas@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'nancy.suarez@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'gilberto.acosta@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'rebeca.padilla@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'ernesto.maldonado@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'olga.cordero@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'arturo.camacho@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'lourdes.burgos@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'gerardo.quiles@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'margarita.pabon@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'sergio.zayas@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'celeste.betancourt@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'felipe.carrion@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'roxana.arroyo@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'rodolfo.valentin@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'yvonne.caban@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'esteban.collazo@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    ),
    (
        'noemi.negron@example.com',
        'password123',
        FALSE,
        FALSE,
        FALSE
    );

-- Make users 1-5 administrators
UPDATE users SET ADMIN = TRUE WHERE id IN (1, 2, 3, 4, 5);

-- Insert administrators
INSERT INTO
    administrators (id, department)
VALUES (1, 'DTOP'),
    (2, 'LUMA'),
    (3, 'AAA'),
    (4, 'DDS'),
    (5, 'DTOP');

-- Insert department admins
INSERT INTO
    department_admins (department, admin_id)
VALUES ('DTOP', 1),
    ('LUMA', 2),
    ('AAA', 3),
    ('DDS', 4);

-- Insert locations around Puerto Rico
INSERT INTO
    location (city, latitude, longitude)
VALUES (
        'Adjuntas',
        18.163485,
        -66.723158
    ),
    (
        'Aguada',
        18.380158,
        -67.188704
    ),
    (
        'Aguadilla',
        18.427445,
        -67.154070
    ),
    (
        'Aguas Buenas',
        18.256899,
        -66.102944
    ),
    (
        'Aibonito',
        18.139959,
        -66.266002
    ),
    (
        'Añasco',
        18.285448,
        -67.140294
    ),
    (
        'Arecibo',
        18.470514,
        -66.721847
    ),
    (
        'Arroyo',
        17.996422,
        -66.092488
    ),
    (
        'Barceloneta',
        18.450500,
        -66.538510
    ),
    (
        'Barranquitas',
        18.186624,
        -66.306280
    ),
    (
        'Bayamón',
        18.389396,
        -66.165322
    ),
    (
        'Cabo Rojo',
        18.086627,
        -67.145735
    ),
    (
        'Caguas',
        18.238800,
        -66.035249
    ),
    (
        'Camuy',
        18.483833,
        -66.844899
    ),
    (
        'Canóvanas',
        18.374875,
        -65.899753
    ),
    (
        'Carolina',
        18.368088,
        -66.042473
    ),
    (
        'Cataño',
        18.446536,
        -66.135578
    ),
    (
        'Cayey',
        18.111905,
        -66.166000
    ),
    (
        'Ceiba',
        18.247518,
        -65.908495
    ),
    (
        'Ciales',
        18.336062,
        -66.468782
    ),
    (
        'Cidra',
        18.175791,
        -66.161278
    ),
    (
        'Coamo',
        18.079962,
        -66.357947
    ),
    (
        'Comerío',
        18.219200,
        -66.225602
    ),
    (
        'Corozal',
        18.341060,
        -66.316840
    ),
    (
        'Culebra',
        18.310394,
        -65.303071
    ),
    (
        'Dorado',
        18.458830,
        -66.267670
    ),
    (
        'Fajardo',
        18.325215,
        -65.653936
    ),
    (
        'Florida',
        18.362450,
        -66.561280
    ),
    (
        'Guánica',
        17.972515,
        -66.908626
    ),
    (
        'Guayama',
        17.984133,
        -66.113777
    ),
    (
        'Guayanilla',
        18.019131,
        -66.791842
    ),
    (
        'Guaynabo',
        18.361295,
        -66.110296
    ),
    (
        'Gurabo',
        18.254399,
        -65.972942
    ),
    (
        'Hatillo',
        18.428464,
        -66.787532
    ),
    (
        'Hormigueros',
        18.133464,
        -67.112812
    ),
    (
        'Humacao',
        18.151574,
        -65.824853
    ),
    (
        'Isabela',
        18.500780,
        -67.024350
    ),
    (
        'Jayuya',
        18.218567,
        -66.591562
    ),
    (
        'Juana Díaz',
        18.053437,
        -66.507508
    ),
    (
        'Juncos',
        18.227456,
        -65.920997
    ),
    (
        'Lajas',
        18.049962,
        -67.059345
    ),
    (
        'Lares',
        18.294670,
        -66.877120
    ),
    (
        'Las Marías',
        18.251900,
        -66.992120
    ),
    (
        'Las Piedras',
        18.185575,
        -65.873625
    ),
    (
        'Loíza',
        18.432990,
        -65.878360
    ),
    (
        'Luquillo',
        18.372451,
        -65.716551
    ),
    (
        'Manatí',
        18.418122,
        -66.526278
    ),
    (
        'Maricao',
        18.180790,
        -66.979900
    ),
    (
        'Maunabo',
        18.007189,
        -65.899329
    ),
    (
        'Mayagüez',
        18.201345,
        -67.145155
    ),
    ('Moca', 18.396793, -67.147904),
    (
        'Morovis',
        18.325785,
        -66.406559
    ),
    (
        'Naguabo',
        18.211625,
        -65.734884
    ),
    (
        'Naranjito',
        18.300786,
        -66.244890
    ),
    (
        'Orocovis',
        18.226922,
        -66.391169
    ),
    (
        'Patillas',
        18.003738,
        -66.013406
    ),
    (
        'Peñuelas',
        18.063358,
        -66.727390
    ),
    (
        'Ponce',
        18.011077,
        -66.614062
    ),
    (
        'Quebradillas',
        18.473833,
        -66.938512
    ),
    (
        'Rincón',
        18.340151,
        -67.249946
    ),
    (
        'Río Grande',
        18.380230,
        -65.831270
    ),
    (
        'Sabana Grande',
        18.077739,
        -66.960455
    ),
    (
        'Salinas',
        18.026837,
        -66.259620
    ),
    (
        'San Germán',
        18.080708,
        -67.041110
    ),
    (
        'San Juan',
        18.463203,
        -66.114757
    ),
    (
        'San Lorenzo',
        18.188691,
        -65.976586
    ),
    (
        'San Sebastián',
        18.336620,
        -66.990180
    ),
    (
        'Santa Isabel',
        17.966078,
        -66.404892
    ),
    (
        'Toa Alta',
        18.388282,
        -66.248224
    ),
    (
        'Toa Baja',
        18.444471,
        -66.254329
    ),
    (
        'Trujillo Alto',
        18.354672,
        -66.007388
    ),
    (
        'Utuado',
        18.265510,
        -66.700452
    ),
    (
        'Vega Alta',
        18.412170,
        -66.331281
    ),
    (
        'Vega Baja',
        18.446146,
        -66.404197
    ),
    (
        'Vieques',
        18.126285,
        -65.440099
    ),
    (
        'Villalba',
        18.121755,
        -66.498579
    ),
    (
        'Yabucoa',
        18.050520,
        -65.879329
    ),
    (
        'Yauco',
        18.034964,
        -66.849898
    );

-- Insert reports with realistic Puerto Rico issues
INSERT INTO
    reports (
        title,
        description,
        status,
        category,
        created_by,
        validated_by,
        resolved_by,
        location,
        city,
        image_url,
        rating,
        created_at,
        resolved_at
    )
VALUES
    -- 1: Santurce -> San Juan (65)
    (
        'Pothole on Main Street',
        'Large pothole on the main street of Santurce that is damaging vehicles',
        'open',
        'pothole',
        6,
        NULL,
        NULL,
        65,
        'San Juan',
        NULL,
        0,
        '2025-01-31 14:05:39',
        NULL
    ),
    -- 2: Roosevelt Ave -> San Juan (65)
    (
        'Fallen Light Pole',
        'Light pole fallen on Roosevelt Avenue after the storm',
        'in_progress',
        'street_light',
        7,
        2,
        NULL,
        65,
        'San Juan',
        NULL,
        0,
        '2025-02-07 11:08:45',
        NULL
    ),
    -- 3: De Diego / Ponce de León -> San Juan (65)
    (
        'Traffic Light Not Working',
        'Traffic light at De Diego and Ponce de León intersection not working',
        'resolved',
        'traffic_signal',
        8,
        3,
        3,
        65,
        'San Juan',
        NULL,
        4,
        '2025-02-14 06:28:36',
        '2025-02-22 13:58:36'
    ),
    -- 4: Hato Rey -> San Juan (65)
    (
        'Water Leak in Pipe',
        'Constant water leak in AAA pipe in Hato Rey',
        'open',
        'sanitation',
        9,
        NULL,
        NULL,
        65,
        'San Juan',
        NULL,
        0,
        '2025-02-26 21:43:16',
        NULL
    ),
    -- 5: generic urbanization -> Caguas (13)
    (
        'Accumulated Trash',
        'Trash accumulation for more than a week in urbanization',
        'in_progress',
        'sanitation',
        10,
        4,
        NULL,
        13,
        'Caguas',
        NULL,
        0,
        '2025-03-13 14:01:44',
        NULL
    ),
    -- 6: "in Bayamón" -> Bayamón (11)
    (
        'Flooded Street',
        'Street floods with every rain in Bayamón',
        'open',
        'road_damage',
        11,
        NULL,
        NULL,
        11,
        'Bayamón',
        NULL,
        0,
        '2025-04-07 01:28:50',
        NULL
    ),
    -- 7: clogged sewer -> Carolina (16)
    (
        'Clogged Sewer',
        'Clogged sewer causing water stagnation',
        'resolved',
        'sanitation',
        12,
        1,
        1,
        16,
        'Carolina',
        NULL,
        5,
        '2025-05-13 15:08:33',
        '2025-05-20 12:03:33'
    ),
    -- 8: flickering light -> Guaynabo (32)
    (
        'Flickering Light',
        'Public street light flickering all night',
        'open',
        'street_light',
        13,
        NULL,
        NULL,
        32,
        'Guaynabo',
        NULL,
        0,
        '2025-06-07 06:51:19',
        NULL
    ),
    -- 9: "in Carolina" -> Carolina (16)
    (
        'Damaged Traffic Sign',
        'Vandalized stop sign in Carolina',
        'in_progress',
        'traffic_signal',
        14,
        5,
        NULL,
        16,
        'Carolina',
        NULL,
        0,
        '2025-06-12 12:32:01',
        NULL
    ),
    -- 10: "Caguas highway" -> Caguas (13)
    (
        'Multiple Potholes',
        'Multiple potholes on Caguas highway',
        'open',
        'pothole',
        15,
        NULL,
        NULL,
        13,
        'Caguas',
        NULL,
        0,
        '2025-06-18 21:37:17',
        NULL
    ),
    -- 11: delayed trash -> Vega Baja (74)
    (
        'Delayed Trash Collection',
        'Trash collection delayed by 3 days',
        'resolved',
        'sanitation',
        16,
        2,
        2,
        74,
        'Vega Baja',
        NULL,
        3,
        '2025-06-22 14:58:02',
        '2025-06-29 18:58:02'
    ),
    -- 12: dangerous pole -> Arecibo (7)
    (
        'Dangerous Pole',
        'Electric pole leaning dangerously',
        'open',
        'street_light',
        17,
        NULL,
        NULL,
        7,
        'Arecibo',
        NULL,
        0,
        '2025-06-29 18:30:01',
        NULL
    ),
    -- 13: misconfigured TL -> Humacao (36)
    (
        'Misconfigured Traffic Light',
        'Traffic light timing misconfigured causing traffic',
        'in_progress',
        'traffic_signal',
        18,
        3,
        NULL,
        36,
        'Humacao',
        NULL,
        0,
        '2025-07-06 23:55:59',
        NULL
    ),
    -- 14: "in Ponce" -> Ponce (58)
    (
        'Obstructed Ditch',
        'Ditch obstructed with debris in Ponce',
        'open',
        'road_damage',
        19,
        NULL,
        NULL,
        58,
        'Ponce',
        NULL,
        0,
        '2025-07-21 23:53:56',
        NULL
    ),
    -- 15: park -> Mayagüez (50)
    (
        'Neglected Recreation Area',
        'Children''s park with trash and damaged equipment',
        'resolved',
        'other',
        20,
        4,
        4,
        50,
        'Mayagüez',
        NULL,
        4,
        '2025-07-28 15:06:42',
        '2025-08-04 10:16:42'
    ),
    -- 16: leaking hydrant -> Cabo Rojo (12)
    (
        'Leaking Fire Hydrant',
        'Fire hydrant with constant leak wasting water',
        'open',
        'sanitation',
        21,
        NULL,
        NULL,
        12,
        'Cabo Rojo',
        NULL,
        0,
        '2025-08-20 02:01:46',
        NULL
    ),
    -- 17: insufficient lighting -> Yauco (78)
    (
        'Insufficient Night Lighting',
        'Dark area due to lack of public lighting',
        'in_progress',
        'street_light',
        22,
        5,
        NULL,
        78,
        'Yauco',
        NULL,
        0,
        '2025-08-31 10:39:07',
        NULL
    ),
    -- 18: missing signage -> San Germán (64)
    (
        'Missing Signage',
        'Missing signage on dangerous curve',
        'open',
        'traffic_signal',
        23,
        NULL,
        NULL,
        64,
        'San Germán',
        NULL,
        0,
        '2025-09-03 21:04:28',
        NULL
    ),
    -- 19: slippery pavement -> Aguadilla (3)
    (
        'Slippery Pavement',
        'Slippery pavement after rains',
        'resolved',
        'road_damage',
        24,
        1,
        1,
        3,
        'Aguadilla',
        NULL,
        5,
        '2025-09-17 12:52:13',
        '2025-09-24 16:37:13'
    ),
    -- 20: broken trash container -> Toa Baja (70)
    (
        'Broken Trash Container',
        'Public trash container vandalized',
        'open',
        'sanitation',
        25,
        NULL,
        NULL,
        70,
        'Toa Baja',
        NULL,
        0,
        '2025-09-21 13:39:40',
        NULL
    ),
    -- 21: loose wiring -> Loíza (45)
    (
        'Loose Wiring',
        'Loose and dangerous electrical wiring',
        'denied',
        'street_light',
        26,
        2,
        NULL,
        45,
        'Loíza',
        NULL,
        0,
        '2025-10-01 17:21:44',
        NULL
    ),
    -- 22: dangerous school intersection -> Manatí (47)
    (
        'Dangerous Intersection',
        'Intersection without traffic light in school area',
        'open',
        'traffic_signal',
        27,
        NULL,
        NULL,
        47,
        'Manatí',
        NULL,
        0,
        '2025-11-02 10:50:46',
        NULL
    ),
    -- 23: insufficient drainage -> Fajardo (27)
    (
        'Insufficient Drainage',
        'Drainage system insufficient for heavy rains',
        'in_progress',
        'road_damage',
        28,
        3,
        NULL,
        27,
        'Fajardo',
        NULL,
        0,
        '2025-11-20 17:21:18',
        NULL
    ),
    -- 24: debris on public road -> Rincón (60)
    (
        'Debris on Public Road',
        'Construction debris on public sidewalk',
        'resolved',
        'other',
        29,
        4,
        4,
        60,
        'Rincón',
        NULL,
        4,
        '2025-11-30 04:42:11',
        '2025-12-06 23:52:11'
    ),
    -- 25: vacant lot -> Hatillo (34)
    (
        'Lack of Lot Maintenance',
        'Vacant lot with high weeds and mosquito breeding grounds',
        'open',
        'sanitation',
        30,
        NULL,
        NULL,
        34,
        'Hatillo',
        NULL,
        0,
        '2025-12-01 11:58:53',
        NULL
    );

-- Insert mock data into pinned_reports table
INSERT INTO
    pinned_reports (user_id, report_id, pinned_at)
VALUES (1, 3, '2025-02-16 09:00:00'),
    (1, 7, '2025-05-15 14:30:00'),
    (1, 11, '2025-06-24 11:15:00'),
    (2, 2, '2025-02-10 10:45:00'),
    (2, 8, '2025-06-10 16:20:00'),
    (2, 12, '2025-07-02 08:30:00'),
    (2, 17, '2025-09-03 13:15:00'),
    (3, 4, '2025-03-01 09:45:00'),
    (3, 16, '2025-08-24 12:00:00'),
    (3, 25, '2025-12-06 10:30:00'),
    (4, 5, '2025-03-17 15:30:00'),
    (4, 15, '2025-08-01 14:15:00'),
    (4, 24, '2025-12-02 11:45:00'),
    (6, 1, '2025-02-03 08:45:00'),
    (6, 10, '2025-06-22 10:30:00'),
    (7, 2, '2025-02-12 12:15:00'),
    (7, 13, '2025-07-10 09:20:00'),
    (8, 3, '2025-02-19 14:00:00'),
    (8, 19, '2025-09-22 16:45:00'),
    (10, 14, '2025-07-25 10:00:00');