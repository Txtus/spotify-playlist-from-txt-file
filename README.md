# Spotify Playlist from TXT File

This project allows you to create a Spotify playlist from a text file containing song titles.

## Prerequisites

- Node.js installed on your machine
- A Spotify Developer account with a registered application

## Setup

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd spotify-playlist-from-txt-file
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your Spotify API credentials:

   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
   ```

4. Ensure you have a `token.json` file in the root directory. If not, it will be created after the login step.

## Running the Project

1. Start the server:

   ```sh
   npm start
   ```

2. Open your browser and navigate to / your browser will be opened:

   ```
   http://localhost:8888/login
   ```

3. Log in to your Spotify account and authorize the application.

4. After successful authentication, you will be prompted to upload a text file containing song titles and provide a playlist title.

5. Submit the form to create the playlist. You will receive a link to the created playlist.

## File Format

The text file should contain song titles in the following format:

```
Artist - Song Title
```

Example:

```
Aretha Franklin - I Say A Little Prayer
Elvis Presley - Suspicious Minds
Simon & Garfunkel - Mrs. Robinson
```

## Notes

- The playlist will be created as a private playlist by default.
- Ensure the song titles are correctly formatted to improve search accuracy.

## License

This project is licensed under the ISC License.
