const connectToDatabase = require('./sqlDBConnection')

const createTables = async () => {
    try {
        const pool = await connectToDatabase();

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
            BEGIN
                CREATE TABLE Users (
                    user_id UNIQUEIDENTIFIER PRIMARY KEY, 
                    email NVARCHAR(255) UNIQUE NOT NULL, 
                    password NVARCHAR(255) NOT NULL, 
                    role NVARCHAR(50) CHECK (role IN ('Admin', 'Editor', 'Viewer')) DEFAULT 'Viewer',
                    created_at DATETIME DEFAULT GETDATE()
                )
            END
        `);

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Artists' AND xtype = 'U')
            BEGIN
                CREATE TABLE Artists (
                    artist_id UNIQUEIDENTIFIER PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    grammy BIT DEFAULT 0, 
                    hidden BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE()
                )
            END
        `);

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Albums' AND xtype = 'U')
            BEGIN
                CREATE TABLE Albums (
                    album_id UNIQUEIDENTIFIER PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    year INT,
                    artist_id UNIQUEIDENTIFIER,
                    hidden BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id)
                )
            END 
        `);

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Tracks' AND xtype = 'U')
            BEGIN
                CREATE TABLE Tracks (
                    track_id UNIQUEIDENTIFIER PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    duration INT, -- Duration in seconds
                    album_id UNIQUEIDENTIFIER,
                    hidden BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (album_id) REFERENCES Albums(album_id)
                )
            END 
        `);

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Favorites' AND xtype = 'U')
            BEGIN
                CREATE TABLE Favorites (
                    favorite_id UNIQUEIDENTIFIER PRIMARY KEY,
                    user_id UNIQUEIDENTIFIER,
                    artist_id UNIQUEIDENTIFIER,
                    album_id UNIQUEIDENTIFIER,
                    track_id UNIQUEIDENTIFIER,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES Users(user_id),
                    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id),
                    FOREIGN KEY (album_id) REFERENCES Albums(album_id),
                    FOREIGN KEY (track_id) REFERENCES Tracks(track_id)
                )
            END
        `);
        pool.close()
        console.log("Tables created successfully!");
    } catch (err) {
        console.error('Error creating tables:', err.message);
    }
};

module.exports = createTables