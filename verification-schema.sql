-- verification-schema.sql

CREATE TABLE business_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    tax_id VARCHAR(100) UNIQUE,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_documents (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES business_profiles(id),
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_listings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES business_profiles(id),
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barter_proposals (
    id SERIAL PRIMARY KEY,
    proposer_id INTEGER REFERENCES business_profiles(id),
    receiver_id INTEGER REFERENCES business_profiles(id),
    service_offered_id INTEGER REFERENCES service_listings(id),
    service_requested_id INTEGER REFERENCES service_listings(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
