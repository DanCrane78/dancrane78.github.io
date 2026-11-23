# Dan Crane: fan site

The fan-facing website at **https://dancrane78.github.io/**. Plain HTML, CSS and a little JS, hosted free on GitHub Pages. No build step.

## Where the content comes from

Most of the page reads the press kit's `content.js` (repo `dancrane78/epk`, live at `/epk/`): the album, bio, players, videos, records, shows, photos, links and the free-song text and Kit form. **Edit it there once, and both sites update.** Images and the Jost font are also loaded from the press kit.

The few things only this site needs are in **`fan.js`**:

| Setting | What it does |
|---|---|
| `tagline` | Line under the album title at the top |
| `freeSong` | `true` shows the free-song sign-up; set `false` once the 250 are gone |
| `shop` | The shop cards (leave a `url` empty to hide one) |
| `pressLine` | The line in "about" that links to the press kit |

The link preview (what shows when the address is shared) is at the top of `index.html`.

## Preview locally

The site loads files from `/epk/`, so preview it with the press kit next to it:

```bash
mkdir -p /tmp/site && cp -r . /tmp/site/ && ln -s /path/to/epk /tmp/site/epk
cd /tmp/site && python3 -m http.server 8000   # open http://localhost:8000
```

## Useful links

- Free song sign-up: https://dancrane78.github.io/#free-song (for Instagram, Linktree and stories)
- Press kit: https://dancrane78.github.io/epk/
