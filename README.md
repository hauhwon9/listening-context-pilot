# Listening Context Similarity Pilot

This is a static pilot survey page. It can run locally or be hosted remotely on any static hosting service.

## Local Run

From the workspace root:

```bash
python3 -m http.server 8123
```

Open:

```text
http://localhost:8123/context-pilot-survey/
```

## Context Links

Use separate links for the two participant groups:

```text
http://localhost:8123/context-pilot-survey/?context=focused
http://localhost:8123/context-pilot-survey/?context=social
```

The same URL parameters will also work after remote hosting.

## Audio Previews

The page uses fixed 30-second Apple preview URLs. Several songs have backup preview URLs, so if one source fails the browser will automatically try the next one. This is more stable than searching the iTunes API at runtime, especially for participants on different networks.

Because these preview files are still hosted by an external Apple CDN, playback in mainland China cannot be guaranteed on every network. If you need fully reliable playback, the strongest option is to self-host short clips on the same site, after confirming copyright/ethics permissions.

You can still host your own clips if needed. Put short audio clips in:

```text
assets/audio/
```

Use these filenames:

```text
S1.mp3
S2.mp3
S3.mp3
S4.mp3
S5.mp3
S6.mp3
S7.mp3
S8.mp3
S9.mp3
S10.mp3
```

Only host audio clips remotely if you have the right to share them.

## Data Collection

The page does not use a backend. Participants download a JSON or CSV file at the end and send it back to the researcher.

## GitHub

Create a GitHub repository and upload the contents of this folder:

```text
index.html
styles.css
app.js
README.md
render.yaml
assets/audio/
```

## Render Static Site

In Render:

1. Create a new Static Site.
2. Connect the GitHub repository.
3. Use this folder as the project root if the repository contains other files.
4. Set Publish Directory to `.`.
5. No build command is required.

After deployment, use links such as:

```text
https://YOUR-RENDER-SITE.onrender.com/?context=focused
https://YOUR-RENDER-SITE.onrender.com/?context=social
```
