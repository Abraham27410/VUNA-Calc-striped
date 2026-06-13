# VUNA Calculator

A smart browser-based calculator with arithmetic, trigonometric functions, theme support, and memory features.

## Features

- Basic arithmetic (+, -, ×, ÷, %, ^)
- Trigonometric functions (sin, cos, tan, asin, acos, atan) with degree mode
- Parentheses and decimal support
- Dark/light theme toggle (persisted in localStorage)
- Smart result memory (`ans` keyword)
- Age/date calculator and currency panels
- Camera/math-solving modal (Tesseract.js OCR)

## Quick Start

```
npm install
```

Open `index.html` in your browser, or use Docker:

```
docker compose up -d
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run tests |
| `npm run lint` | Lint source code |
| `npm run format` | Format source code |

## Deployment

The project is a static site. Recommended deployment options:

- **Docker**: `docker compose up -d` (serves via nginx on port 80)
- **Static hosting**: Serve the `index.html` and `assets/` directory with any web server (nginx, Apache, etc.)
- **GitHub Pages**: Push to a `gh-pages` branch

A CI pipeline (GitHub Actions) runs lint and tests on every push.

## Docker

```
docker compose up -d
```

Opens at `http://localhost:80`. The multi-stage Dockerfile runs lint and tests during the build.

## License

MIT
