# 🤝 Contributing to PlantTwin AI Platform

Thank you for your interest in contributing to **PlantTwin AI™**. This document outlines guidelines and procedures for team members and contributors.

---

## 🛠 Development Workflow

### 1. Branch Naming Conventions
- `feature/` for new features (e.g., `feature/scada-replay-scrubber`)
- `fix/` for bug fixes (e.g., `fix/light-theme-contrast`)
- `docs/` for documentation updates (e.g., `docs/api-guide`)
- `refactor/` for code restructuring

### 2. Commit Message Standards
We follow Conventional Commits:
- `feat(telemetry): add live scatter correlation chart`
- `fix(runtime): resolve alarm trigger modal backdrop blur`
- `style(theme): update CSS design variables for light mode`
- `docs(readme): add docker compose quickstart instructions`

---

## 🧪 Code Quality & Testing

### Frontend Guidelines
- All UI components must use standard CSS variables (`var(--bg-canvas)`, `var(--bg-card)`, `var(--text-primary)`, `var(--text-secondary)`).
- Search input fields MUST include `.input-nexus-search` to guarantee left padding for search icons.
- Font family MUST adhere to **Inter** font family hierarchy.

### Backend Guidelines
- Use AsyncSession for all SQLAlchemy ORM operations.
- Enforce strict typing with Pydantic v2 schemas (`model_config = ConfigDict(from_attributes=True)`).
- Handle HTTP errors gracefully with standard `APIResponse` models.

---

## 🔒 Security Guidelines
Never commit API secrets, private JWT keys, or production database credentials to git. Use `.env` templates for local execution.
