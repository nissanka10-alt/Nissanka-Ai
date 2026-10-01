# Repository Guidelines

## Project Structure & Module Organization

Astro static output is the approved architecture for the redesign. New pages live in `src/pages/`, shared UI in `src/components/`, layouts in `src/layouts/`, and static assets in `public/`. Existing root HTML and asset directories remain source material during migration and must not be deleted until their Astro replacements are approved. Keep public routes lowercase and hyphenated. There is currently no automated test directory.

## Build, Test, and Development Commands

Install the pinned dependencies from `package-lock.json`. Astro must generate static HTML only; do not enable SSR.

- `npm install` - install the pinned local toolchain.
- `npm run dev` - run Astro locally during development.
- `npm run build` - generate the production site in `dist/`.
- `npm run preview` - review the generated static build locally.
- `git status --short` - confirm only intended files changed.

## Coding Style & Naming Conventions

Use four-space indentation in Astro, HTML, CSS, and JavaScript. Prefer semantic HTML, accessible labels, keyboard-friendly controls, and reusable Astro components. Shared header, footer, layout, metadata, schema, breadcrumb, CTA, and form patterns should replace duplicated markup. Avoid unnecessary client-side JavaScript and do not add React, Vue, Svelte, or another UI framework. Preserve existing URLs unless an approved redirect exists. Use British English and keep diffs focused.

## Testing Guidelines

Testing is currently manual. Build before review, then check every changed page at desktop and mobile widths. Verify navigation, internal and external links, images, metadata, structured data, forms, generated routes, and keyboard operation. Do not modify `robots.txt` or `llms.txt` without explicit approval. Do not submit real personal data while testing FormSubmit.

## Commit & Pull Request Guidelines

The limited history does not establish a formal commit convention. Use short, imperative, sentence-case messages, for example `Add AI governance insight page`. Keep each commit focused. Pull requests should explain the purpose and scope, list manual checks performed, link relevant issues, and include before-and-after screenshots for visible changes.

## Security & Deployment

Never commit secrets or personal test data. Do not change the FormSubmit recipient or Cloudflare dashboard settings without explicit approval. Cloudflare Workers Static Assets remains the deployment target. Production must not be changed, merged, pushed, or deployed without explicit approval. Do not invent business claims, case studies, reviews, testimonials, client names, statistics, or outcomes.
