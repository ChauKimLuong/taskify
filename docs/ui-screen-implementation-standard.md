# UI Screen Implementation Standard

> This file is the source of truth for implementing visible UI screens in this project.
> Task files define what a screen does. This file defines how it must be structured and styled.

## 1. Stack Check

This project uses:
- Node.js
- Express
- Pug templates
- Plain CSS organized by `base`, `components`, `layout`, and `pages`
- Prisma for data access

This project does **not** use Angular.
Do not write Angular component, template, SCSS, routing, or form rules for this repo.

## 2. Scope

Apply this standard to every visible screen under:
- `views/client/pages/**/*.pug`
- `views/client/partials/**/*.pug`
- `public/css/pages/**/*.css`
- `public/css/components/**/*.css`
- `public/css/layout/**/*.css`

This standard does not define:
- business logic
- database rules
- auth rules
- service/controller behavior

## 3. Non-Negotiable Rules

1. Reuse existing UI patterns before creating new ones.
2. Follow the wireframe and task file for behavior and content order.
3. Keep one clear primary action per screen.
4. Every interactive screen must show loading, success, and error feedback when relevant.
5. Build mobile-first.
6. Use semantic HTML first.
7. Keep templates readable and shallow.
8. Never hardcode one-off visual values in templates.

## 4. File Placement

Use these locations:

```text
views/client/pages/{feature}/{screen}.pug
public/css/pages/{screen}.css
```

Reusable UI belongs in:

```text
views/client/partials/
public/css/components/
public/css/layout/
```

Do not bury page-specific markup inside partials.
Do not put reusable blocks directly into one page file if they are used in multiple screens.

## 5. Page Structure

Each page should follow this order unless the wireframe explicitly says otherwise:

1. Page wrapper
2. Header block
3. Page-level status or error banner
4. Primary content
5. Secondary content
6. Action row

Preferred Pug structure:

```pug
main.page
  section.page__header
    div
      p.page__eyebrow Section label
      h1.page__title Page title
      p.page__subtitle Short supporting description.
    .page__actions
      a.btn.btn--secondary(href="/path") Secondary
      button.btn(type="submit") Primary

  if error
    .banner.banner--error(role="alert") Something went wrong.

  section.page__content
    article.card
      h2.section-title Section title
      p.section-subtitle Optional supporting text.
```

## 6. Template Rules

- Use semantic tags: `main`, `section`, `header`, `form`, `label`, `button`, `table`.
- Prefer `include` for repeated UI blocks.
- Keep nesting shallow.
- Do not put inline CSS in Pug templates.
- Do not put heavy data transformation in templates.
- Do not duplicate large markup trees for simple state changes.
- Escape output by default; only render raw HTML when there is a reviewed reason.

## 7. Form Rules

All forms must use this order:

1. Label
2. Input
3. Helper text if needed
4. Validation error
5. Server error if field-specific

Requirements:
- Every input must have a visible label.
- Placeholder is not a label.
- Required state must be clear.
- Primary submit action must be obvious.
- Disable repeated submission while processing.

## 8. Styling Rules

- Prefer existing variables in `public/css/base/variables.css`.
- Reuse existing component classes before adding new page-specific rules.
- Keep page CSS small and focused on layout or page-only states.
- Put shared button, input, form, banner, card, and divider styles in `components/`.
- Put shell/container/header structure in `layout/`.
- Put only screen-specific overrides in `pages/`.

Do not:
- add inline style attributes in Pug
- invent new colors when an existing token works
- create screen-only button or input styles if a shared component should exist
- mix unrelated spacing and typography patterns on different pages

## 9. Visual Language

The product should feel:
- clean
- calm
- readable
- professional
- consistent

Use color semantically:
- primary action
- success
- warning
- error
- muted text
- disabled state

Do not use color as decoration without meaning.

## 10. Feedback States

Handle these states when relevant:

- Default: normal interactive state
- Loading: visible indicator, no duplicate action
- Success: visible confirmation or clear redirect
- Validation error: shown below the field
- Non-field error: page-level or card-level banner
- Empty state: message plus optional CTA
- Disabled state: visible but not interactive

Never leave users with a blank area or a frozen button and no explanation.

## 11. Accessibility

Required:
- logical heading order
- keyboard-reachable controls
- visible focus states
- readable contrast
- associated labels for inputs
- `role="alert"` only where needed for important status messages

Do not remove focus outlines unless a clear replacement exists.

## 12. Responsive Rules

- Start with a stacked mobile layout.
- Enhance for wider screens.
- Stack cramped actions on narrow screens.
- Wrap dense content in horizontal scroll when needed.
- Do not force multi-column layouts on small screens.

## 13. Controller and Route Boundary

Keep responsibilities clear:
- controllers prepare data and screen state
- routes decide access and navigation flow
- Pug renders UI
- CSS controls presentation

Do not place raw database logic in templates.
Do not place styling decisions in controllers.

## 14. Precedence

Use this order:

1. `docs/ui-screen-implementation-standard.md`
2. task file and wireframe
3. existing shared UI patterns in the repo
4. local page-specific styling only when necessary

If a task asks for styling that conflicts with this file, follow this file.

## 15. Completion Checklist

Before marking a UI task complete, verify:

- screen structure matches the wireframe
- page uses the shared layout pattern
- no inline CSS was introduced
- shared variables and shared components were reused
- primary action is visually clear
- loading, error, success, and empty states are covered
- mobile and desktop layouts both work
- semantic HTML and keyboard flow are intact
- controller/template/style responsibilities stay separated

## 16. Prompt-Sized Agent Rule

Use this short instruction in task prompts:

> Read `docs/ui-screen-implementation-standard.md` before editing any `.pug` or UI CSS file. Follow it for structure, styling, accessibility, responsiveness, and feedback states. Reuse existing tokens and shared UI patterns. Do not use Angular patterns in this repo.
