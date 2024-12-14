Music Library Management API
This is the API documentation for the Music Library Management application, deployed on Vercel at https://music-library-managment.vercel.app. This API allows users to manage their music library by adding, retrieving, and removing favorite artists, albums, and tracks.

Technology Stack
Backend: Node.js, Express.js
Database: Microsoft SQL Server (Azure)
Deployment: Vercel
Authentication
The API uses JWT (JSON Web Token) for authentication. You need to obtain a valid JWT token before accessing any protected APIs.


Authentication:

Login: /login
Signup: /signup
Logout: /logout
User:

Get User Profile: /users/profile
Update User Profile: /users/profile
Artists:

Get All Artists: /artists
Get Artist by ID: /artists/:artistId
Albums:

Get All Albums: /albums
Get Album by ID: /albums/:albumId
Get Albums by Artist: /artists/:artistId/albums
Tracks:

Get All Tracks: /tracks
Get Track by ID: /tracks/:trackId
Get Tracks by Album: /albums/:albumId/tracks
Favorites:

Add Favorite: /favorites/add
Get Favorites: /favorites/:category
Remove Favorite: /favorites/remove/:favoriteId
Please note:

Replace placeholders like :artistId, :albumId, :trackId, and :favoriteId with actual IDs.
Ensure you have the necessary authentication and authorization mechanisms in place to protect your API endpoints.
Consider adding pagination and filtering options to your API endpoints for better performance and user experience.
Remember to adjust the base URL and specific endpoint paths based on your deployment and routing configuration.