# Contributing to PocketFridge

Thank you for your interest in contributing to PocketFridge! This document provides guidelines and instructions for contributing to the project.

## 🤝 Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies** with `npm install`
3. **Set up the database** with `npm run db:setup`
4. **Create a branch** for your feature or fix

## 📝 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run the development server
npm run dev

# Run linter
npm run lint

# Format code
npm run format
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add item search functionality"
git commit -m "fix: resolve expiry date calculation bug"
git commit -m "docs: update API documentation"
```

Common commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no functional changes)
- `refactor:` - Code restructuring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title describing the change
- Detailed description of what was changed and why
- Screenshots for UI changes
- Reference any related issues

## 🎨 Code Style

### JavaScript

- Use ES6+ features (const/let, arrow functions, template literals)
- Use single quotes for strings
- Use semicolons
- Use 2 spaces for indentation
- Follow ESLint rules (run `npm run lint`)

### CSS

- Use meaningful class names
- Group related properties
- Use CSS variables for colors and common values
- Follow mobile-first approach for responsive design

### HTML

- Use semantic HTML5 elements
- Keep markup clean and well-structured
- Add appropriate ARIA labels for accessibility

## 📁 Project Structure

```
src/
├── index.js              # Server entry point
├── routes/              # API routes
│   ├── fridge.js       # Fridge endpoints
│   └── items.js        # Item endpoints
├── database/           # Database layer
│   ├── db.js          # Connection and schema
│   └── setup.js       # Initialization
├── controllers/       # Business logic (add here)
├── models/           # Data models (add here)
├── middleware/       # Custom middleware (add here)
└── utils/            # Helper functions (add here)

public/
├── index.html        # Main page
├── css/
│   └── style.css     # Styles
└── js/
    └── app.js        # Frontend logic
```

## 🧪 Testing Guidelines

When adding new features:

1. **Manual Testing**
   - Test all user flows
   - Check edge cases
   - Verify error handling
   - Test on different screen sizes

2. **API Testing**
   - Use curl or Postman to test endpoints
   - Verify response formats
   - Check error responses

3. **Future: Automated Tests**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - E2E tests for critical user flows

## 🐛 Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/environment information

## ✨ Feature Requests

When suggesting features:

- Describe the problem it solves
- Explain the proposed solution
- Consider alternative approaches
- Discuss potential impact

## 📋 Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (when implemented)
- [ ] Linter passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

## 🔍 Code Review Process

1. **Automated Checks**
   - Linting must pass
   - No merge conflicts

2. **Peer Review**
   - At least one team member approval
   - All comments addressed

3. **Merge**
   - Squash commits for clean history
   - Update related documentation

## 💬 Communication

- Use GitHub Issues for bug reports and features
- Use Pull Requests for code discussions
- Tag team members for specific questions
- Be respectful and constructive

## 🚀 Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production

## ❓ Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Ask in team discussion
4. Create a new issue

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PocketFridge! 🎉
