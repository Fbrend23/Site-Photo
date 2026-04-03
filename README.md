# Site-Photo

[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

---

## Description

**Site-Photo** is a photography portfolio website for **Brendan Fleurdelys**. It features a public gallery with category filtering and lightbox, plus an admin back-office for managing photos.

**Tech stack:** Vue 3 + Vite + TypeScript (frontend), Node.js + Express (API), Tailwind CSS, Docker.

---

## Features

- Animated home page with hero section
- Photo gallery with category filtering (mammals, birds, insects, reptiles, landscapes)
- Lightbox modal with prev/next navigation and keyboard support
- Admin dashboard with inline photo editing
- Image upload with automatic WebP conversion
- Responsive design with mobile hamburger menu
- Dark theme with Dancing Script typography

---

## Project Structure

```
client/          Vue 3 SPA (Vite + TypeScript + Tailwind)
server/          Node.js API (Express + TypeScript)
  data/          Gallery images + metadata JSON
```

---

## Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start dev servers
cd server && npm run dev    # API on http://localhost:3000
cd client && npm run dev    # Vite on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the Express API.

---

## Production (Docker)

```bash
# Build client and server
cd client && npm run build
cd ../server && npm run build

# Run with Docker
docker compose up --build
```

The app will be available at `http://localhost:8080`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photos` | List all photos |
| GET | `/api/photos/:id` | Get single photo |
| POST | `/api/photos/upload` | Upload image (multipart) |
| PUT | `/api/photos/:id` | Update description/category |
| DELETE | `/api/photos/:id` | Delete photo |

---

## License

MIT - Brendan Fleurdelys
