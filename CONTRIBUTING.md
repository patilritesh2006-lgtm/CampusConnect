# Contributing to CampusConnect

Thank you for your interest in contributing to **CampusConnect**! We welcome contributions from developers of all skill levels to help make college campuses more engaging, connected, and digitally empowered.

---

## 📋 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Development Workflow](#development-workflow)
4. [Branch Naming Conventions](#branch-naming-conventions)
5. [Commit Message Guidelines](#commit-message-guidelines)
6. [Running Tests Locally](#running-tests-locally)
7. [Submitting a Pull Request](#submitting-a-pull-request)

---

## 📜 Code of Conduct
By participating in this project, you agree to abide by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛠️ How to Contribute

### 1. Fork & Clone
```bash
# Fork the repo on GitHub, then clone your fork:
git clone https://github.com/YOUR_USERNAME/CampusConnect.git
cd CampusConnect
```

### 2. Set Up Upstream Remote
```bash
git remote add upstream https://github.com/patilritesh2006-lgtm/CampusConnect.git
```

---

## 🌿 Branch Naming Conventions

Always create a new branch from `main` with a descriptive prefix:

- `feat/<feature-name>` (e.g. `feat/event-badges`)
- `fix/<bug-description>` (e.g. `fix/qr-timestamp-offset`)
- `docs/<documentation-change>` (e.g. `docs/api-guide`)
- `refactor/<module-name>` (e.g. `refactor/auth-middleware`)
- `test/<test-suite>` (e.g. `test/certificate-verification`)

---

## 💬 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```text
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Examples:
- `feat(qr): add rotating HMAC-SHA256 event check-in token`
- `fix(auth): prevent timing attack on password reset token verification`
- `docs(readme): add architecture diagram and API reference table`
- `test(attendance): add unit tests for bulk roll call toggle`

---

## 🧪 Running Tests Locally

Before submitting any Pull Request, ensure that all automated tests pass with 0 errors:

### Backend Tests:
```bash
cd backend
npm test
```

### Frontend Tests & Production Build:
```bash
cd frontend
npm test
npm run build
```

---

## 🚀 Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request on GitHub against `main`.
3. Provide a clear summary of the changes made, any screenshots if applicable, and linked issues.
4. Ensure GitHub Actions CI passes completely.

Thank you for helping improve CampusConnect!
