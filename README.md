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

Each push to `master` deploys the site to the web server. The `Deploy` workflow (`.github/workflows/deploy.yml`) syncs the site with rsync over SSH. You can also start it by hand from the Actions tab.

- The workflow logs in as the `deploy` user on `humboshot.com`. On the server, the key can only run rsync writes inside the web root (`rrsync -wo`). It cannot open a shell, read files or forward ports.
- The server host key is pinned in the workflow. If the server is rebuilt, update `DEPLOY_HOST_KEY`.
- The sync deletes server files that are not in the repo. It does not upload `.git/`, `.github/`, `.vscode/`, `.claude/`, `README.md` or the `publish` scripts.

Add this repository secret:

| Secret | Content |
| --- | --- |
| `DEPLOY_SSH_KEY` | Private ED25519 key without a passphrase, used only for this deploy |

To copy the site to a local folder or share, run `publish.cmd`. It mirrors the site with robocopy. Set the destination with `-Destination <path>` or with the `WEBSITE_PUBLISH_DEST` environment variable. Add `-DryRun` to see the changes first.
