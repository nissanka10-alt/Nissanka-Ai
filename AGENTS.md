# Repository Guidelines

## Project Structure & Module Organization

This repository is a static website with no application framework or build system. Core pages (`index.html`, `privacy.html`, and `thank-you.html`) live in the repository root alongside `sitemap.xml`, `llms.txt`, and shared images. The insights landing page is `insights/index.html`; each article uses its own directory, such as `insights/safe-ai-at-work/index.html`. Keep new public pages in similarly descriptive, lowercase, hyphenated directories. There is currently no automated test directory.

## Build, Test, and Development Commands

No dependency installation or build command is required. Tailwind CSS and Google Fonts load from CDNs.

- `python -m http.server 8000` - serve the repository locally.
- Open `http://localhost:8000/` - review the homepage and follow internal links.
- `git status --short` - confirm only intended files changed.

Opening an HTML file directly is acceptable for quick visual checks, but a local server better reflects production routing.

## Coding Style & Naming Conventions

Use four-space indentation in HTML, CSS, and inline JavaScript, matching the existing pages. Prefer semantic HTML, accessible labels, keyboard-friendly controls, and concise JavaScript. Reuse the established Tailwind utility patterns and colour palette instead of introducing new frameworks or tooling. Use lowercase, hyphenated URL paths and descriptive asset names. No formatter or linter is configured, so keep diffs focused and preserve surrounding style.

## Testing Guidelines

Testing is manual. Check every changed page at desktop and mobile widths. Verify navigation, internal and external links, images, metadata, the contact form, and basic keyboard operation. When adding a public page, also review `sitemap.xml` and `llms.txt`. Do not submit real personal data while testing FormSubmit.

## Commit & Pull Request Guidelines

The limited history does not establish a formal commit convention. Use short, imperative, sentence-case messages, for example `Add AI governance insight page`. Keep each commit focused. Pull requests should explain the purpose and scope, list manual checks performed, link relevant issues, and include before-and-after screenshots for visible changes.

## Security & Deployment

Never commit secrets or personal test data. Do not change the FormSubmit recipient or deployment settings without explicit approval. Cloudflare configuration is managed outside this repository; do not deploy, publish, merge, or push unless specifically requested.
