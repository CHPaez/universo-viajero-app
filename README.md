# Universo Viajero — Frontend

Sitio interactivo tipo collage/scrapbook de [El Viajero Imaginario](https://www.instagram.com/el_viajero_imaginario/): un universo espacial navegable con soles, planetas y un reproductor de audio ambiental. Consume la API del [backend Laravel](https://github.com/CHPaez/universo-viajero-api).

## Stack

- React 19 + TypeScript
- Vite
- `motion` (Framer Motion)

## Desarrollo local

Requisitos: Node.js, y el [backend](https://github.com/CHPaez/universo-viajero-api) corriendo (por defecto se espera en `http://localhost:8000`).

```bash
npm install
cp .env.example .env
npm run dev
```

Si el backend corre en otra URL/puerto, ajustá `VITE_API_URL` en `.env`.

Abre en `http://localhost:5173` (o el puerto que Vite elija si ese está ocupado).

## Build de producción

```bash
npm run build
```

Genera un `dist/` estático — no necesita Node corriendo en el servidor, se sirve directo con Nginx (o cualquier hosting estático). Antes de buildear, apuntá `VITE_API_URL` en `.env` a la URL real de la API en producción.

## Deploy a producción (Hetzner u otro VPS)

1. En el mismo servidor donde está el backend (o en cualquier hosting estático):
   ```bash
   git clone https://github.com/CHPaez/universo-viajero-app.git
   cd universo-viajero-app
   npm install
   echo "VITE_API_URL=https://tu-dominio-api-real" > .env
   npm run build
   ```
2. Servir `dist/` con Nginx: `root` apuntando a esa carpeta, `try_files $uri /index.html` (es una SPA).
3. En el backend, agregar el dominio/subdominio real de este frontend a `allowed_origins` en `config/cors.php` — si no, la API rechaza las peticiones del navegador.
4. SSL con `certbot --nginx`.
