# Power Prez Tools

A PowerPoint add-in that copies one image's **position and size** and pastes
it onto another — so images line up and match without manual dragging.

It adds a **Power Prez Tools** group to PowerPoint's **Home** tab:

- **Copy dimensions and position** — capture the selected image's geometry.
- **Paste dimensions and position** — apply both to the selected image.
- **Paste options** ▾ — _Paste dimensions only_ / _Paste position only_.

Works in PowerPoint for Mac, Windows, and on the web.

## Install (for users)

You need [Node.js](https://nodejs.org) 18+ and PowerPoint 2019 or later
(or Microsoft 365). Then run:

```
npx power-prez-tools install
```

Fully quit PowerPoint (Cmd+Q on Mac) and reopen it. The buttons appear on
the **Home** tab in the **Power Prez Tools** group.

That's it — there's nothing to host or configure. The add-in's code is
served from GitHub Pages; the command above just registers it with
PowerPoint.

**Privacy:** the add-in only reads and sets the selected shape's position
and size. The captured value is stored locally on your machine; nothing is
sent anywhere, and there is no tracking or account.

### Use it

1. Select an image and click **Copy dimensions and position**.
2. Select another image.
3. Click **Paste dimensions and position** (or use the **Paste options**
   dropdown for position-only / dimensions-only).

The captured value persists until you copy again (even across restarts).

### Uninstall

```
npx power-prez-tools uninstall
```

Then restart PowerPoint.

### Troubleshooting

- **Buttons don't appear:** fully quit PowerPoint (not just the window)
  and reopen — ribbon changes only apply on a clean launch.
- **"Can't load the add-in":** check your internet connection; the add-in
  loads its code from GitHub Pages.
- **Older PowerPoint:** the add-in requires the PowerPoint JavaScript API
  1.4. Very old builds show a "too old" message — update PowerPoint.

## Develop

```
npm install
npm test          # BDD suite (Cucumber.js), no PowerPoint needed
npm run lint
npm start         # sideload against the local dev server on a Mac
```

Architecture and the BDD workflow are documented in
[`docs/testing.md`](docs/testing.md). All capture/paste logic is pure and
unit-tested; the only PowerPoint-coupled code is a thin Office.js adapter.

## Release (for maintainers)

One-time setup:

1. In the GitHub repo: **Settings → Pages → Build and deployment →
   Source: GitHub Actions**. Pushing to `main` then deploys the add-in to
   <https://lpalokan.github.io/Power-Prez-Tools> via
   `.github/workflows/pages.yml` (the manifest's URLs are rewritten to the
   Pages URL automatically at build time).
2. If the repository is ever renamed or moved, update `DEFAULT_BASE_URL`
   in `tools/make-prod-manifest.mjs` to match the new Pages URL (it is the
   URL baked into the manifest bundled in the npm package).

To publish the installer CLI:

```
npm publish
```

`prepublishOnly` lints, runs the BDD suite, compiles the CLI to `lib/`,
and generates `manifest.prod.xml` (pointing at the Pages URL) which is
bundled into the package. Users then get the new version via `npx`.

## License

MIT — see [LICENSE](LICENSE).
