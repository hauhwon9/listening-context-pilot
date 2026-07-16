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

## Audio Clips

Put short audio clips in:

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

If a clip is missing, participants can use the `Open original/search` link.

Only host audio clips remotely if you have the right to share them.

By default, embedded audio clips are disabled so remote participants do not see broken audio players. Participants use the `Open original/search` link instead.

To enable hosted clips later, upload the MP3 files and set `ENABLE_AUDIO_CLIPS` to `true` in `app.js`.

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
