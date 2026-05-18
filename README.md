# Power Prez Tools

A PowerPoint add-in that copies one image's **position and size** and pastes
it onto another — so images line up and match without manual dragging.

It adds a **Power Prez Tools** group to PowerPoint's **Home** tab:

- **Copy dimensions and position** — capture the selected image's geometry.
- **Paste dimensions and position** — apply both to the selected image.
- **Paste options** ▾ — _Paste dimensions only_ / _Paste position only_.

Currently **macOS only** — PowerPoint for Mac (PowerPoint 2019 or later,
or Microsoft 365). Windows support is in development.

## Install (for users)

You need [Node.js](https://nodejs.org) 18+ and PowerPoint 2019 or later
(or Microsoft 365).

**macOS (stable):**

```
npx power-prez-tools install
```

**Windows (beta):** Windows support is currently in beta — opt in with
the `@beta` tag:

```
npx power-prez-tools@beta install
```

Fully quit PowerPoint (Cmd+Q on Mac, or close all windows on Windows) and
reopen it. The buttons appear on the **Home** tab in the **Power Prez
Tools** group.

On macOS the manifest is placed in PowerPoint's add-in folder; on Windows
it is registered via the per-user developer registry entry.
`uninstall` (same command, with `uninstall`) reverses either.

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
- **"EPERM / operation not permitted" during install:** macOS blocks
  command-line tools from writing into PowerPoint's protected folder. The
  installer detects this and prints step-by-step manual instructions (it
  saves the manifest to your Downloads and opens Finder at the right
  place — just create a `wef` folder and drop the file in). Alternatively,
  grant your terminal **Full Disk Access** (System Settings → Privacy &
  Security → Full Disk Access), reopen it, and re-run the install.

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

Release/publish steps for maintainers live in
[`docs/testing.md`](docs/testing.md).

## License

MIT — see [LICENSE](LICENSE).
