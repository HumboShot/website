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

Each push to `master` deploys the site to the Namecheap hosting. The `Deploy` workflow (`.github/workflows/deploy.yml`) mirrors the site with lftp over FTPS (FTP with forced TLS and a certificate check). You can also start it by hand from the Actions tab.

The workflow uses a cPanel FTP account whose folder is the document root. Create the account under cPanel → FTP Accounts, use it only for this deploy, and add these repository secrets:

| Secret | Content |
| --- | --- |
| `FTP_HOST` | Server hostname, for example `server192-5.web-hosting.com`. Use the hostname, not the IP, or the certificate check fails. |
| `FTP_USER` | Full FTP username, for example `deploy@humboshot.com` |
| `FTP_PASSWORD` | Password of the FTP account |

The mirror deletes files that are not in the repo, but it keeps `.well-known/`, `.htaccess`, `cgi-bin/` and `.ftpquota` on the server.

To copy the site to a local folder or share, run `publish.cmd`. It mirrors the site with robocopy. Set the destination with `-Destination <path>` or with the `WEBSITE_PUBLISH_DEST` environment variable. Add `-DryRun` to see the changes first.
