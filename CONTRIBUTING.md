# Contributing to Lumière Restaurant Management System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Guidelines](#issue-guidelines)
8. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Personal attacks or insults
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** installed
- **Git** for version control
- **Supabase** account (free tier)
- Code editor (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/restobar-management-system.git
   cd restobar-management-system
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/restobar-management-system.git
   ```

### Install Dependencies

```bash
pnpm install
```

### Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials.

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Development Workflow

### Branching Strategy

We use **Git Flow** with these branch types:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
# Update your fork
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### Commit Messages

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(kitchen): add real-time order updates to KDS

fix(pos): resolve change calculation rounding error

docs(readme): update installation instructions

test(auth): add login form validation tests
```

### Making Changes

1. **Write clean code** following our standards
2. **Add tests** for new features
3. **Update documentation** if needed
4. **Test your changes** thoroughly

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Before Committing

```bash
# Format code
pnpm lint:fix

# Run all checks
pnpm type-check
pnpm lint
pnpm test
```

---

## Coding Standards

### TypeScript

- **Always use TypeScript** for new files
- **Define types** for all props and function parameters
- **Avoid `any`** - use proper types or `unknown`
- **Use interfaces** for object shapes

**Example:**
```typescript
// ✅ Good
interface MenuItemProps {
  id: string
  name: string
  price: number
  onSelect: (id: string) => void
}

// ❌ Bad
function MenuItem(props: any) {
  // ...
}
```

### React Components

- **Use functional components** with hooks
- **Extract complex logic** into custom hooks
- **Keep components small** (< 200 lines)
- **Use proper prop destructuring**

**Example:**
```tsx
// ✅ Good
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn('btn', `btn-${variant}`)}>
      {children}
    </button>
  )
}

// ❌ Bad - no types, inline styles
export function Button(props) {
  return <button style={{ color: 'blue' }}>{props.text}</button>
}
```

### Server Actions

- **Use `"use server"`** directive
- **Validate all inputs** before processing
- **Return consistent error objects**
- **Log important actions**

**Example:**
```typescript
"use server"

export async function createMenuItem(formData: FormData) {
  const supabase = await createClient()
  
  // Validate input
  const name = formData.get("name") as string
  if (!name?.trim()) {
    return { error: "Name is required" }
  }
  
  // Process
  const { error } = await supabase.from("menu_items").insert({ name })
  if (error) return { error: error.message }
  
  // Log and revalidate
  await logActivity("menu.created", "menu_item", { name })
  revalidatePath("/admin/menu")
  
  return { success: true }
}
```

### Styling

- **Use Tailwind CSS** utility classes
- **Follow mobile-first** approach
- **Use design system** colors and spacing
- **Avoid inline styles**

**Example:**
```tsx
// ✅ Good
<div className="flex items-center gap-4 rounded-lg bg-card p-4 shadow-sm">
  <h2 className="text-lg font-semibold">Title</h2>
</div>

// ❌ Bad
<div style={{ display: 'flex', padding: '16px', background: '#fff' }}>
  <h2 style={{ fontSize: '18px' }}>Title</h2>
</div>
```

### File Organization

```
components/
  ├── ComponentName.tsx       # Component
  ├── ComponentName.test.tsx  # Tests
  └── index.ts                # Exports (optional)
```

### Naming Conventions

- **Components:** PascalCase (`MenuItemCard.tsx`)
- **Files:** kebab-case (`use-cart-state.ts`)
- **Functions:** camelCase (`calculateTotal()`)
- **Constants:** UPPER_SNAKE_CASE (`TAX_RATE`)
- **Types/Interfaces:** PascalCase (`OrderStatus`)

---

## Testing Guidelines

### Test Coverage

Aim for:
- **Unit tests:** 80%+ coverage
- **Integration tests:** Critical user flows
- **E2E tests:** Main workflows

### Writing Tests

**Structure:**
```typescript
describe('ComponentName', () => {
  describe('specific feature', () => {
    it('should do expected behavior', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

**Example:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('should render children', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply variant class', () => {
    render(<Button onClick={() => {}} variant="secondary">Click me</Button>)
    expect(screen.getByText('Click me')).toHaveClass('btn-secondary')
  })
})
```

### Test Data

- **Use factories** for test data
- **Mock external dependencies**
- **Clean up** after tests

```typescript
// test-utils/factories.ts
export function createMockMenuItem(overrides = {}) {
  return {
    id: 'test-id-1',
    name: 'Test Item',
    price: 100,
    category_id: 'cat-1',
    is_available: true,
    ...overrides,
  }
}
```

---

## Pull Request Process

### Before Submitting

- [ ] ✅ All tests pass
- [ ] ✅ Code is formatted (`pnpm lint:fix`)
- [ ] ✅ Type checks pass (`pnpm type-check`)
- [ ] ✅ Documentation updated
- [ ] ✅ Commit messages follow convention
- [ ] ✅ Branch is up to date with `develop`

### Creating a Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub:**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Select `develop` as the base branch
   - Fill in the PR template

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Testing
How to test these changes:
1. Step one
2. Step two
3. Expected result

## Screenshots (if applicable)
Add screenshots to show UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

### Review Process

1. **Automated checks** run (tests, linting, type checking)
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** into `develop`

### After Merge

Your feature branch will be deleted. Update your local repository:

```bash
git checkout develop
git pull upstream develop
git branch -d feature/your-feature-name
```

---

## Issue Guidelines

### Reporting Bugs

**Before submitting:**
- Check if the issue already exists
- Test on the latest version
- Collect relevant information

**Bug Report Template:**
```markdown
## Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 0.1.0]

## Additional Context
Any other information about the problem.
```

### Feature Requests

**Feature Request Template:**
```markdown
## Problem
Clear description of the problem this feature would solve.

## Proposed Solution
How you envision the feature working.

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Any other information or screenshots.
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Needs immediate attention
- `priority: medium` - Important but not urgent
- `priority: low` - Nice to have

---

## Community

### Communication Channels

- **GitHub Discussions** - General questions and discussions
- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions

### Getting Help

- Check the [README](./README.md) first
- Search existing issues and discussions
- Ask in GitHub Discussions
- Tag your questions appropriately

### Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- Project README (for major features)

---

## Development Tips

### VS Code Extensions (Recommended)

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript Vue Plugin (Volar)** - Better TypeScript support
- **GitLens** - Git integration

### Useful Commands

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Database schema
# Run in Supabase SQL Editor
\i COMPLETE_DATABASE_SCHEMA.sql

# Generate types from database (if Supabase CLI installed)
supabase gen types typescript --project-id your-project > lib/types/database.ts

# Check bundle size
pnpm build
pnpm analyze
```

### Debugging

**Client-side:**
```typescript
// Use React DevTools in browser
console.log('Debug info:', data)
```

**Server-side:**
```typescript
// Server actions log to terminal
console.log('[DEBUG]', 'Server data:', data)
```

**Database queries:**
```typescript
const { data, error } = await supabase.from('orders').select('*')
console.log({ data, error })
```

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Learning Resources
- [Next.js Learn](https://nextjs.org/learn)
- [React Tutorial](https://react.dev/learn)
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

---

## Questions?

If you have questions not covered here:
1. Check the [README](./README.md)
2. Search [existing issues](https://github.com/yourusername/restobar-management-system/issues)
3. Ask in [GitHub Discussions](https://github.com/yourusername/restobar-management-system/discussions)

---

**Thank you for contributing! 🎉**

Your contributions help make Lumière better for everyone in the hospitality industry.
