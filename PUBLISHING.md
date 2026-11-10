# Publish the preserved Rainbow release

The local Git repository is ready. Its annotated release tag is **v0.1.0-rainbow**. Publishing is separate from preservation: the release can be restored locally even before GitHub is configured.

## First publication

1. Sign into GitHub and [create a repository](https://github.com/new) named **ai-agent-workshop** under your own account. Choose **Public** for the free GitHub Pages option. Leave README, .gitignore, and license initialization unchecked: this local repository already has its first commit.
2. Open a terminal in this repository folder. Run the commands below. They upload only the audited Git files and tag, not ignored hosting settings or browser workspace data. Git for Windows may open a browser to sign in; no token needs to be pasted into the application or a file.

```powershell
git remote add origin https://github.com/BookWyrm88/ai-agent-workshop.git
git push -u origin main
git push origin v0.1.0-rainbow
```

If `origin` already exists, inspect `git remote -v` instead of adding it again. If that repository name is already used, choose another unused name and use its exact GitHub URL above. Do not force-push over an existing repository.

3. In the GitHub repository, open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, **main**, and **/docs**, then **Save**.
4. Once the Pages deployment succeeds, use **Visit site** in that settings page. For the suggested repository name, the expected URL is `https://bookwyrm88.github.io/ai-agent-workshop/`. This is an expected address, not evidence that a deployment has occurred.
5. Optional: under **Releases → Draft a new release**, choose the existing `v0.1.0-rainbow` tag. Name it **Rainbow Workshop — v0.1.0-rainbow** and copy the release notes from `releases/v0.1.0-rainbow/RELEASE_NOTES.md`. A GitHub Release page is optional; the pushed annotated tag already preserves the commit.

The `/docs` publishing folder contains only the self-contained app and `.nojekyll`, so source documentation, tests, and local server code do not become part of the website. Public repository source is still visible on GitHub.

GitHub's current instructions: [publishing from a branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [Pages entry-point requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Move your local workspace to the hosted site

Before switching addresses, open your existing local Workshop and select **Export workshop**. Keep that JSON backup outside this repository. Open the new Pages site, choose **Import backup**, and select the export. Local files and GitHub Pages use different browser storage; publishing source code does not transfer your workspace automatically.

Import merges agents with new IDs and their conversations, runs, and evaluations. Existing IDs are preserved rather than overwritten. Tutorial state and unsaved drafts are not imported. Check the imported agents before clearing any old browser storage.

## Future iterations

The `main` branch may advance. The Rainbow tag must continue to refer to its original commit. Do not delete, recreate, or force-update release tags.

```powershell
git switch -c feature/next-iteration
# Make the next iteration's changes, then:
npm ci
npm test
npm run build:pages
npm run test:pages
git add dist docs tests scripts package.json package-lock.json README.md CHANGELOG.md
npm run audit:staged
git diff --cached --stat
git commit -m "Describe the next iteration"
```

Review and merge the branch before publishing a new release. Choose a new version and new annotated tag for that release. Run `npm run verify:rainbow` at any time to verify the original tagged application, even when the working tree contains newer code. Regenerate and commit `docs/index.html` whenever application code changes; GitHub Pages deploys the committed `/docs` content from `main`.

For an independent copy of the preserved release:

```powershell
git worktree add --detach ../ai-agent-workshop-rainbow v0.1.0-rainbow
```

Use an unused destination folder. A separate `.bundle` backup supplied with this release can also restore the repository without GitHub: `git clone <bundle-file> <new-folder>`.

## Privacy before every upload

Run `npm run audit:staged` after staging, review the staged diff, and keep exported workspaces, screenshots, account files, secrets, and personal documents out of Git. Pattern checks are a useful gate, not a guarantee. Use a GitHub no-reply commit address; check `git log -1 --format=fuller` before uploading.
