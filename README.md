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

Each push to `master` deploys the site to the Namecheap hosting. The `Deploy` workflow (`.github/workflows/deploy.yml`) mirrors the site with rsync over SSH. You can also start it by hand from the Actions tab.

The workflow needs these repository secrets:

| Secret | Content |
| --- | --- |
| `DEPLOY_SSH_KEY` | Private key that is authorized in cPanel → SSH Access. Use it only for this deploy. |
| `DEPLOY_KNOWN_HOSTS` | Host key line of the server (`ssh-keyscan -p 21098 <host>`) |
| `DEPLOY_HOST` | Server hostname |
| `DEPLOY_PORT` | SSH port (`21098` on Namecheap) |
| `DEPLOY_USER` | cPanel username |
| `DEPLOY_PATH` | Document root, for example `public_html/` |

The mirror deletes files that are not in the repo, but it keeps `.well-known/`, `.htaccess` and `cgi-bin/` on the server.

To copy the site to a local folder or share, run `publish.cmd`. It mirrors the site with robocopy. Set the destination with `-Destination <path>` or with the `WEBSITE_PUBLISH_DEST` environment variable. Add `-DryRun` to see the changes first.
