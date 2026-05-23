# Guía de Despliegue en Producción

## Prerrequisitos del servidor

| Componente | Versión mínima | Notas |
|-----------|---------------|-------|
| PHP | 8.1 | |
| Extensión `pdo_mysql` | — | Para conectar a MySQL |
| Extensión `pdo_sqlite` | — | Para el historial local |
| Extensión `json` | — | Incluida por defecto en PHP 8 |
| Apache / Nginx | Cualquier versión reciente | Ver configuración abajo |
| Node.js + npm | 18+ | Solo necesario para el build — no en producción |

### Verificar extensiones PHP

```bash
php -m | grep -E 'pdo|sqlite|json'
# Debe mostrar: PDO, pdo_mysql, pdo_sqlite, json
```

---

## Proceso de build

```bash
# Desde la raíz del proyecto
./script/build.sh
```

El script realiza:
1. Limpia `/build/`
2. Ejecuta `ng build --base-href /compare/` en `/frontend/`
3. Copia el output de Angular a `/build/`
4. Copia todo `/backend/` a `/build/compare_php/`
5. Crea `/build/compare_php/history/` (vacío — SQLite se crea en runtime)

**Output:**
```
build/
├── index.html              ← Angular SPA
├── main-XXXXX.js
├── styles-XXXXX.css
├── chunk-XXXXX.js  (×n)
├── favicon.ico
└── compare_php/            ← PHP Backend
    ├── .env_cfg
    ├── .htaccess
    ├── index.php
    ├── api/
    ├── lib/
    └── history/            ← SQLite se crea aquí
```

---

## Despliegue en Apache

### 1. Copiar los archivos

```bash
# Asumiendo que el DocumentRoot es /var/www/html
sudo cp -r build/* /var/www/html/compare/
```

### 2. Configurar Apache

El `.htaccess` del backend requiere `AllowOverride All`:

```apache
# /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80>
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Habilitar `mod_rewrite`:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 3. Permisos de escritura para SQLite

```bash
# El directorio history/ necesita ser escribible por el proceso de Apache
sudo chown www-data:www-data /var/www/html/compare/compare_php/history/
sudo chmod 755 /var/www/html/compare/compare_php/history/
```

### 4. Ajustar `.env_cfg`

```bash
nano /var/www/html/compare/compare_php/.env_cfg
```

```ini
APP_ENV=production
APP_DEBUG=false          # ← Importante: false en producción
CORS_ORIGIN=http://tuservidor.com/compare
HISTORY_DB_PATH=./history/history.sqlite
MAX_HISTORY_ENTRIES=100
DB_CONNECT_TIMEOUT=10
```

### 5. Verificar

```
http://tuservidor.com/compare/                        → Angular SPA
http://tuservidor.com/compare/compare_php/api/health  → {"status":"ok","php":"8.x.x"}
```

---

## Despliegue en Nginx

```nginx
server {
    listen 80;
    server_name tuservidor.com;
    root /var/www/html;

    # Frontend Angular — enviar todo a index.html (HTML5 routing)
    location /compare/ {
        alias /var/www/html/compare/;
        try_files $uri $uri/ /compare/index.html;
    }

    # Backend PHP
    location /compare/compare_php/ {
        alias /var/www/html/compare/compare_php/;
        
        location ~ \.php$ {
            fastcgi_pass unix:/run/php/php8.1-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
        }
        
        # Reescribir a index.php para el router
        if (!-f $request_filename) {
            rewrite ^ /compare/compare_php/index.php last;
        }
    }
}
```

---

## Variables de entorno — referencia completa

| Variable | Default | Descripción |
|----------|---------|-------------|
| `APP_ENV` | `development` | `development` o `production` |
| `APP_DEBUG` | `true` | `true`: stack traces en errores; `false`: mensajes genéricos |
| `APP_BASE_PATH` | `/compare/compare_php` | Prefijo de ruta del backend (debe coincidir con la URL real) |
| `CORS_ORIGIN` | `*` | Origen permitido para CORS. En producción usar el dominio exacto |
| `HISTORY_DB_PATH` | `./history/history.sqlite` | Ruta al archivo SQLite (relativa al backend) |
| `MAX_HISTORY_ENTRIES` | `100` | Número máximo de comparaciones a conservar |
| `DB_CONNECT_TIMEOUT` | `10` | Timeout de conexión a MySQL en segundos |
| `DB_QUERY_TIMEOUT` | `60` | Timeout de query en segundos |

---

## Consideraciones de producción

### HTTPS

Siempre usar HTTPS en producción. Las credenciales MySQL viajan en el body del POST — sin HTTPS irían en texto claro.

```bash
sudo certbot --apache -d tuservidor.com
```

### Acceso restringido

Aunque la app no tiene autenticación, se puede restringir por IP en Apache:

```apache
<Location /compare/>
    Require ip 192.168.1.0/24
    Require ip 10.0.0.0/8
</Location>
```

### Límite de tiempo de ejecución PHP

Para bases de datos grandes, aumentar el timeout en `.htaccess` o `php.ini`:

```ini
max_execution_time = 120
```

### Tamaño de respuesta

El diff completo de bases de datos muy grandes puede generar respuestas JSON de varios MB.  
Si se usan proxies (Nginx), ajustar:
```nginx
proxy_read_timeout 120;
client_max_body_size 16M;
```

---

## Desarrollo local con PHP built-in server

No requiere Apache/Nginx para desarrollo:

```bash
# Terminal 1 — Backend
cd backend
php -S localhost:8080 index.php

# Terminal 2 — Frontend (con proxy)
cd frontend
npm start -- --proxy-config proxy.conf.json
```

`frontend/proxy.conf.json`:
```json
{
  "/compare/compare_php": {
    "target": "http://localhost:8080",
    "secure": false,
    "pathRewrite": { "^/compare/compare_php": "" }
  }
}
```

Acceder en: `http://localhost:4200`
