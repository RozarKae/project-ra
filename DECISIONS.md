# Project Decisions

This document records important architectural and design decisions made throughout Project RA.

These decisions should not be changed without a strong technical or user experience reason.

---

# Frontend Framework

Decision

Use Vanilla HTML, CSS and JavaScript.

Reason

The project is lightweight, loads faster, is easier to deploy on GitHub Pages, and does not require a frontend framework.

---

# Animation Library

Decision

Use GSAP.

Reason

GSAP provides smooth, production-quality animations with excellent browser compatibility and performance.

---

# Hosting

Decision

GitHub Pages.

Reason

Simple deployment, free hosting, version control integration, and reliable static hosting.

---

# Design Style

Decision

Luxury cinematic wedding invitation.

Reason

The website should feel premium, timeless, and emotionally engaging rather than resembling a generic event website.

---

# Color Palette

Decision

Dark background with Gold and Emerald accents.

Reason

Represents elegance, luxury, and complements the Islamic-inspired design language.

---

# Typography

Decision

Cinzel

Cormorant Garamond

Amiri

Poppins

Reason

Creates a balance between luxury, readability, and cultural elegance.

---

# Development Workflow

Decision

Review-driven AI development.

Reason

AI should propose changes before implementation to minimize regressions and maintain code quality.

---

# AI Documentation

Decision

Maintain AGENTS.md, PROJECT_OVERVIEW.md, ROADMAP.md, DESIGN_SYSTEM.md, CHANGELOG.md, TODO.md, and DECISIONS.md.

Reason

Provide a persistent project memory for AI assistants and future contributors.

---

# Code Style

Decision

Prefer modular, reusable, maintainable code.

Reason

Improves scalability and reduces technical debt.

---

# Performance

Decision

Optimize before adding new features whenever practical.

Reason

Maintains a smooth user experience and strong Lighthouse scores.

---

# Rule

If a future decision changes any of the above, update this document with:

- What changed
- Why it changed
- When it changed