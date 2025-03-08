import dotenv from "dotenv";
import express from "express";
import open from "open";
import fs from "fs";
import readline from "readline";
import SpotifyWebApi from "spotify-web-api-node";
import path from "path";
import multer from "multer";

dotenv.config();

const app = express();
const port = 8888;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));

// Step 1: Redirect User to Spotify Login
const scopes = [
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-private",
];

app.get("/login", (req, res) => {
  const authURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authURL);
});

// Step 2: Handle Callback and Get Access Token
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);

    fs.writeFileSync("token.json", JSON.stringify(data.body)); // Save token

    res.send(`
      <form action="/upload" method="post" enctype="multipart/form-data">
        <label for="file">Select a file:</label>
        <input type="file" id="file" name="file" accept=".txt" required>
        <label for="title">Playlist Title:</label>
        <input type="text" id="title" name="title" required>
        <button type="submit">Submit</button>
      </form>
    `);
  } catch (error) {
    res.send("Error getting access token.");
  }
});

// Step 3: Handle File Upload and Execute Main Function
app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const playlistTitle = req.body.title;

  try {
    const songTitles = await readSongTitles(filePath);
    const trackURIs = await searchTracks(songTitles);

    if (trackURIs.length > 0) {
      let playList = await createPlaylist(playlistTitle, trackURIs);
      res.send(
        `Playlist created successfully! Check your Spotify account. Direct link: <a href='${playList}'>Spotify</a>`
      );
    } else {
      res.send("No valid tracks found.");
    }
  } catch (error) {
    res.send("Error creating playlist.");
  } finally {
    fs.unlinkSync(filePath); // Clean up uploaded file
  }
});

// Step 4: Read Song Titles
async function readSongTitles(filePath) {
  const songTitles = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) songTitles.push(line.trim());
  }
  return songTitles;
}

// Step 5: Search for Songs
async function searchTracks(songTitles) {
  const trackURIs = [];
  for (const title of songTitles) {
    try {
      const res = await spotifyApi.searchTracks(title, { limit: 1 });
      if (res.body.tracks.items.length > 0) {
        trackURIs.push(res.body.tracks.items[0].uri);
        console.log(`Found: ${title}`);
      } else {
        console.log(`Not Found: ${title}`);
      }
    } catch (error) {
      console.error(`Error searching for "${title}":`, error);
    }
  }
  return trackURIs;
}

// Step 6: Create Playlist
async function createPlaylist(name, trackURIs) {
  try {
    const me = await spotifyApi.getMe(); // Fetch user info
    console.log("User ID:", me.body.id); // Debugging

    const playlist = await spotifyApi.createPlaylist(name, { public: false });
    console.log("Playlist created:", playlist.body); // Debugging

    if (!playlist.body || !playlist.body.id) {
      throw new Error("Failed to create playlist. Response invalid.");
    }

    await spotifyApi.addTracksToPlaylist(playlist.body.id, trackURIs);
    console.log(`Playlist created: ${playlist.body.external_urls.spotify}`);
    return playlist.body.external_urls.spotify;
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
}

// Start Express Server
app.listen(port, () => {
  console.log(`Login at: http://localhost:${port}/login`);
  open(`http://localhost:${port}/login`); // Auto-open browser
});
