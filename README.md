# website

The source for [humboshot.com](https://humboshot.com). It is a single static page in a terminal style.

## Files

- `index.html`: the page
- `css/main.css`: the styles
- `js/main.js`: the interactive shell. It reads the directories, files and links from the sections in `index.html`, so you only edit links there.
- `img/favicon.ico`: the favicon
- `robots.txt`: crawler rules

## View locally

Open `index.html` in a browser, or serve the folder:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish

Run `publish.cmd`. It mirrors the site to the destination folder with robocopy. Set the destination with `-Destination <path>` or with the `WEBSITE_PUBLISH_DEST` environment variable. Add `-DryRun` to see the changes first.
