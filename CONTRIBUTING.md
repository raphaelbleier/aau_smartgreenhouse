# Contributing to AAU Smart Greenhouse 🌱

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected behavior vs actual behavior
- Your environment (OS, Node.js version, ESP32 board, etc.)
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please create an issue describing:
- The feature you'd like to see
- Why it would be useful
- How it should work
- Any implementation ideas you have

### Submitting Pull Requests

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test your changes**
   - Test the backend: `cd backend && npm test`
   - Test the frontend: `cd frontend && npm run build`
   - Test Arduino code compilation

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions or changes
   - `chore:` - Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Describe what your changes do
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

### Prerequisites
- Node.js v16+
- npm or yarn
- Arduino IDE (for ESP32 development)
- Git

### Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/aau_smartgreenhouse.git
cd aau_smartgreenhouse

# Install dependencies
npm run install-all

# Start development
npm run dev
```

## Code Style

### JavaScript/Node.js
- Use ES6+ features
- Use `const` by default, `let` when needed
- Use meaningful variable names
- Add JSDoc comments for functions
- Use async/await instead of callbacks

### React
- Use functional components with hooks
- Keep components small and focused
- Use descriptive prop names
- Add PropTypes or TypeScript types

### Arduino/C++
- Follow Arduino code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## Project Structure

```
aau_smartgreenhouse/
├── backend/          # Node.js Express backend
├── frontend/         # React frontend
├── homeassistant/    # Home Assistant configs
├── docker/           # Docker configurations
├── systemd/          # Systemd service files
└── Greenhouse_*.ino  # ESP32 firmware
```

## Testing

- Backend: Add tests in `backend/test/`
- Frontend: Add tests in `frontend/src/__tests__/`
- Manual testing is required for ESP32 firmware

## Documentation

- Update README.md for major changes
- Update API documentation for API changes
- Add inline code comments for complex logic
- Update configuration examples

## Questions?

Feel free to open an issue with the `question` label!

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).
