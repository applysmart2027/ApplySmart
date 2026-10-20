# ADR-0005: Mulish as the app typeface, with a vivid blue accent

| | |
|---|---|
| **Status** | Proposed, pending team review |
| **Date** | 2026-10-17 |
| **Deciders** | Anthony Vydysh; team review pending |

## Context

The first shell used the operating system's font and a navy accent. Anthony reviewed it in the browser on 2026-10-17 and found it plain. He chose a lighter, more precise style instead: large headings in a light weight, a saturated blue, pill-shaped controls, and rounded white surfaces. ADR-0002 already requires every colour and size to come from `tokens.css`, so the question was which typeface and accent to put there, and whether to add a dependency for the font.

## Decision

Mulish is the only typeface in the app. It is loaded from the `@fontsource-variable/mulish` package, version 5.3.0, imported at the top of `src/shared/styles/tokens.css` next to the `--font-sans` token that names it. One variable font file covers weights 200 to 1000: page headings use 300, body text 400, navigation 500, link names and the active item 600, and the wordmark 800.

The accent becomes #2350F5, a vivid blue, with #E8EEFF as a soft tint behind the active navigation pill. Controls that the user acts on are pill-shaped (`--radius-pill`), and grouped content sits on white panels with a 1rem radius (`--radius-lg`).

## Consequences

**Positive:** headings and body text have a recognisable character on every operating system, where the system font differed between Windows and macOS. Changing the accent is still a one-file edit in `tokens.css`. White text on the accent measures 5.9:1 and the accent as text on the page background 5.5:1, so both pass WCAG AA.

**Negative:** the app gains its first dependency beyond React and react-router. The build ships five font files of 10 to 30 KB each for Latin, extended Latin, Cyrillic, extended Cyrillic and Vietnamese; browsers download only the subsets a page uses, which for English text is the 30 KB Latin file. Text renders in the fallback font for a moment before Mulish arrives, because the package uses `font-display: swap`. Changing the typeface later is not a one-file edit: the font weights set in `base.css` and `app.css` are chosen for Mulish, and a weight-300 heading is too thin in some system fonts. Teammates have not reviewed the change.

**Neutral:** the navy accent recorded in ADR-0002's description of the visual direction is replaced by this decision. ADR-0002's styling rules are unchanged.

## Alternatives considered

**Keep the system font with stronger weights** - For: no dependency, no download. Against: the light-weight headings that define the style look different on every operating system and are too thin in some system fonts. Why not chosen: it did not produce the look Anthony asked for.

**Load Mulish from Google Fonts** - For: no package to install. Against: every page view sends a request to a third-party server, and the app stops matching its design when offline. Why not chosen: self-hosting through the package keeps the font in the build.

**A brighter blue such as #2F6BFF** - For: closer to the brightest blues in the reference screenshots. Against: #2F6BFF measures 4.2:1 as text on the page background and fails WCAG AA. Why not chosen: #2350F5 is the brightest blue tested that passes in both directions.

## References

Font identity confirmed on 2026-10-17 by rendering Mulish at weight 300 in Chrome next to Anthony's reference screenshot. Contrast ratios computed with the WCAG relative-luminance formula. Package licence: SIL Open Font License 1.1.
