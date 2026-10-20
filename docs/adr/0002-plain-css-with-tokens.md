# ADR-0002: Plain CSS with role-named custom properties

| | |
|---|---|
| **Status** | Proposed, pending team review. ADR-0005 replaces the deep-blue accent described below |
| **Date** | 2026-10-16 |
| **Deciders** | Anthony Vydysh; team review pending |

## Context

The Visual Paradigm wireframes fix layout and behaviour, not colours or type. Four developers must produce screens that look like one application, the palette must be changeable later in one place, and the project rules forbid decorative effects. Several component kits were considered, including shadcn with Tailwind and the Skiper UI registry.

## Decision

We style with plain CSS. Every colour, font size, spacing step, radius, and shadow is a custom property in `src/shared/styles/tokens.css`, named by role (`--color-accent`, `--color-surface`) rather than by value. Component CSS references tokens only. There is one stylesheet per shared primitive and one per feature, with no utility framework, no CSS-in-JS, and no component library. The visual direction is a light neutral surface with one deep-blue accent, recorded in `DESIGN.md` from Increment 2.

## Consequences

**Positive:** a palette change is one file. Diffs stay readable because markup carries no utility classes. No build step scans templates for class names.

**Negative:** the team writes its own Button, Field, and table styles instead of taking accessible primitives from a kit. Teammates who know Tailwind lose that familiarity. Keyboard and focus behaviour must be tested by hand rather than inherited.

**Neutral:** the underline-sweep link hover Anthony liked from Skiper UI is reproduced in a few lines of CSS rather than imported.

## Alternatives considered

**Tailwind with shadcn/ui** - For: accessible primitives in minutes and a look many developers recognise. Against: utility classes in every file, a setup each teammate must replicate, and it conflicts with the rule to reuse components rather than restyle them inline. Why not chosen: the prototype has six screens and five shared primitives, which plain CSS covers.

**CSS Modules** - For: scoped class names with no runtime. Against: one more file per component for an app this size. Why not chosen: a per-feature stylesheet gives enough scoping now; this can be adopted later without rewriting tokens.

**Material UI** - For: complete and accessible. Against: large bundle, hard to match the wireframes' plain layout. Why not chosen: too much to learn and override in four days.

## References

Skiper UI `skiper40` registry entry inspected on 2026-10-16 (requires Tailwind, declares an unused framer-motion dependency, requires attribution). CLAUDE.md, "Styling and component reuse".
