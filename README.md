# phpMySQLDiff

> **Compara la estructura de dos bases de datos MySQL, detecta diferencias y genera un script SQL de migración documentado.**

---

## ¿Qué es esto?

**phpMySQLDiff** es una aplicación web full-stack que conecta a dos bases de datos MySQL (origen y destino), extrae su estructura completa y produce:

- Un **reporte visual** de diferencias (tablas, vistas, funciones, procedimientos, triggers)
- Un **script SQL de actualización** documentado, listo para revisar y aplicar
- Un **historial persistente** de comparaciones anteriores (SQLite, sin motor externo)

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | PHP 8.1+ · PDO MySQL · PDO SQLite |
| Frontend | Angular 17+ · PrimeNG 21 · highlight.js |
| Layout/Estilos | PrimeFlex · CSS Variables · Dark Mode |
| Persistencia | SQLite (sin servidor) |
| Build | Bash script |

## Estructura del repositorio

```
phpMySQLdiff/
├── backend/          # PHP REST API
├── frontend/         # Angular SPA
├── build/            # Artefactos de producción (generado)
├── docs/             # Documentación
├── script/           # Scripts de automatización
└── README.md
```

## Inicio rápido

### Prerrequisitos

- PHP 8.1+ con extensiones `pdo_mysql` y `pdo_sqlite`
- Node.js 18+ y npm
- Apache con `mod_rewrite` habilitado (o cualquier servidor PHP)
- Acceso a dos bases de datos MySQL para comparar

### Instalación y build

```bash
# 1. Clonar / descargar el repositorio
cd phpMySQLdiff

# 2. Instalar dependencias del frontend
cd frontend && npm install && cd ..

# 3. Build de producción
./script/build.sh
```

El script genera `/build/` con:
- `/build/` → Frontend Angular (sirve en `http://servidor/compare/`)
- `/build/compare_php/` → Backend PHP (disponible en `http://servidor/compare/compare_php/`)

### Desarrollo local

```bash
# Terminal 1 — Backend PHP
cd backend
php -S localhost:8080 index.php

# Terminal 2 — Frontend Angular
cd frontend
npm start
# Acceder en http://localhost:4200
```

> En desarrollo, el frontend llama a `/compare/compare_php/` — ajusta `APP_BASE_PATH` en `.env_cfg` o usa un proxy de desarrollo.

## Configuración

Edita `backend/.env_cfg`:

```ini
APP_ENV=development
APP_DEBUG=true
CORS_ORIGIN=*
HISTORY_DB_PATH=./history/history.sqlite
MAX_HISTORY_ENTRIES=100
DB_CONNECT_TIMEOUT=10
```

## Deploy en producción (Apache)

```
DocumentRoot /var/www/html

# Copiar build/ a /var/www/html/compare/
cp -r build/* /var/www/html/compare/

# Asegurarse que AllowOverride All está habilitado
# para que el .htaccess del backend funcione
```

## Documentación completa

| Documento | Descripción |
|-----------|-------------|
| [arquitectura.md](docs/arquitectura.md) | Arquitectura del sistema y flujo de datos |
| [backend.md](docs/backend.md) | API REST — endpoints, request/response |
| [frontend.md](docs/frontend.md) | Componentes Angular y estructura del SPA |
| [comparador.md](docs/comparador.md) | Lógica de extracción y comparación de schemas |
| [script-sql.md](docs/script-sql.md) | Formato y estructura del script SQL generado |
| [historial.md](docs/historial.md) | Sistema de historial SQLite |
| [deploy.md](docs/deploy.md) | Guía de despliegue en producción |

## Licencia

MIT — libre para uso personal y comercial.
