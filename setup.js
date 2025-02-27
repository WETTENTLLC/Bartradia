// setup.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseSetup {
    constructor() {
        this.dbPath = process.env.DB_PATH || ':memory:';
        this.db = null;
    }

    async init() {
        try {
            // Create database connection
            this.db = await this.createConnection();
            
            // Initialize database schema
            await this.createTables();
            
            // Add initial data if needed
            if (process.env.NODE_ENV === 'development') {
                await this.addSeedData();
            }

            console.log('Database setup completed successfully');
        } catch (error) {
            console.error('Database setup failed:', error);
            throw error;
        } finally {
            await this.closeConnection();
        }
    }

    createConnection() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(new Error(`Database connection failed: ${err.message}`));
                } else {
                    console.log(`Connected to database at ${this.dbPath}`);
                    resolve(db);
                }
            });
        });
    }

    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )`,
            // Add more table creation statements here
        ];

        for (const table of tables) {
            await this.run(table);
        }
        console.log('Tables created successfully');
    }

    async addSeedData() {
        const seedData = [
            `INSERT INTO items (name, description) VALUES 
                ('Sample Item 1', 'Description for item 1'),
                ('Sample Item 2', 'Description for item 2'),
                ('Sample Item 3', 'Description for item 3')`
            // Add more seed data here
        ];

        for (const sql of seedData) {
            await this.run(sql);
        }
        console.log('Seed data added successfully');
    }

    run(sql) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async closeConnection() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            });
        }
    }
}

// Run setup
if (require.main === module) {
    const setup = new DatabaseSetup();
    setup.init()
        .then(() => {
            console.log('Database setup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

module.exports = DatabaseSetup;
