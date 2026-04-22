# PrintForge

PrintForge is a standalone full-stack product customization application.

## Stack

- Backend: Django, Django REST Framework, Celery, Redis, PostgreSQL
- Image pipeline: OpenCV, Pillow, NumPy
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Infrastructure: Docker, docker-compose

## Project Structure

```text
backend/
  apps/
    products/
    customization/
    rendering/
  printforge/
  requirements.txt
  Dockerfile
frontend/
  src/
    components/
    hooks/
    pages/
    services/
  package.json
  tailwind.config.js
  Dockerfile
media/
  products/
  uploads/
  results/
docker-compose.yml
README.md
```

## Features

- Premium dark SaaS-style UI with glassmorphism cards, blue and violet accents, and animated interactions
- Sidebar product catalog grouped by category
- Product preview workspace with view switching for front, back, and side
- Drag-and-drop design upload
- Zoom, reposition, and print-size controls
- Async rendering pipeline with progress polling
- Downloadable finished mockup
- Django admin support for product uploads, print area mapping, and perspective point configuration
- Automatic product discovery from files placed in `media/products/`
- Unit tests for core rendering logic

## Backend API

- `GET /api/products/`
- `GET /api/products/:id/`
- `GET /api/products/:id/views/`
- `POST /api/customize/`
- `GET /api/customize/:id/status/`
- `GET /api/customize/:id/result/`

## Rendering Pipeline

1. Accept uploaded artwork and store the original asset.
2. Fit the design proportionally into the configured print area.
3. Apply perspective warp with OpenCV.
4. Composite the warped design onto the garment while preserving the base product image.
5. Save the rendered image and expose progress updates to the frontend.

## Local Development

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Run Celery in a second terminal:

```bash
cd backend
.venv\Scripts\activate
celery -A printforge worker -l info
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

If you want the Vite frontend to call a custom backend host, create `frontend/.env` with:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Services

- PostgreSQL should be running on port `5432`
- Redis should be running on port `6379`
- Django API runs on port `8000`
- React app runs on port `3000`
- Django admin runs at `http://localhost:8000/admin/`

## Docker Setup

```bash
docker compose up --build
```

This starts:

- PostgreSQL
- Redis
- Django backend
- Celery worker
- Frontend served through Nginx

Once containers are up:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/products/`
- Admin: `http://localhost:8000/admin/`

## Django Admin Workflow

1. Create or edit a product in Django admin.
2. Add product views for `front`, `back`, or `side`.
3. Upload the garment image for each view.
4. Use the visual mapper canvas to drag the print area.
5. Click four points on the preview to define perspective corners.
6. Save and test through the frontend customizer.

## Folder-Driven Products

If you only want to drop blank garment images into the product folder and start using them, place them in [media/products](d:/Downloads/task/media/products) and run:

```bash
cd backend
python manage.py sync_media_products
```

Filename behavior:

- `blank-hoodie-front.png` -> product `Blank Hoodie`, view `front`
- `blank-hoodie-back.png` -> same product, view `back`
- `raw-dress-side.png` -> product `Raw Dress`, view `side`
- `my-garment.png` -> product `My Garment`, default view `front`

## Tests

Run the rendering utility tests with:

```bash
cd backend
python manage.py test apps.rendering
```

## Notes

- Media files are stored at the repo root under `media/`
- The frontend polls the status endpoint to surface rendering progress
- The project is intentionally isolated from any previous codebase
