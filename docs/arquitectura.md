# Arquitectura del Sistema

## Visión general

phpMySQLDiff es una aplicación web de **una sola página (SPA)** con backend PHP. La comunicación entre ambas capas es exclusivamente vía **API REST JSON**.

```
┌──────────────────────────────────────────────────────────────┐
│                    Navegador del usuario                      │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │             Angular SPA (PrimeNG + highlight.js)     │  │
│   │                                                      │  │
│   │  /compare  ──→  CompareComponent                    │  │
│   │  /history  ──→  HistoryComponent                    │  │
│   └──────────────────┬───────────────────────────────────┘  │
└─────────────────────-│───────────────────────────────────────┘
                       │ HTTP/JSON  (fetch via Angular HttpClient)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│             PHP Backend  (/compare/compare_php/)             │
│                                                              │
│   index.php  ──→  Router  ──→  api/*.php                    │
│                                    │                         │
│                              lib/Database.php                │
│                              lib/SchemaExtractor.php         │
│                              lib/SchemaComparator.php        │
│                              lib/ScriptGenerator.php         │
│                              lib/HistoryManager.php          │
│                                    │              │           │
│                             MySQL (×2)       SQLite          │
│                          [origen] [dest]    [historia]       │
└──────────────────────────────────────────────────────────────┘
```

## Flujo de datos — comparación

```
Usuario ingresa credenciales
         │
         ▼
[1] POST /api/test-connection   (opcional, por panel)
         │  ConnectionTestResult {success, version}
         ▼
[2] POST /api/compare
    { origin: DbConnection, dest: DbConnection }
         │
         ├── SchemaExtractor(origin) ──→ INFORMATION_SCHEMA queries
         │         └──→ SchemaOrigin {tables, views, functions, procedures, triggers}
         │
         ├── SchemaExtractor(dest)   ──→ INFORMATION_SCHEMA queries
         │         └──→ SchemaDest   {tables, views, functions, procedures, triggers}
         │
         ├── SchemaComparator.compare(origin, dest)
         │         └──→ Diff {tables[], views[], ...}  (status: added|removed|modified|equal)
         │
         ├── ScriptGenerator.generate(diff)
         │         └──→ SQL script (string)
         │
         ├── HistoryManager.save(sqlite)
         │         └──→ history_id (int)
         │
         └──→ JSON response {history_id, summary, diff, script}
                   │
                   ▼
         Angular renderiza:
           - Summary cards (métricas)
           - Tabs: Tables | Views | Functions | Procedures | Triggers | SQL Script
```

## URLs del sistema

| Ruta | Qué sirve |
|------|-----------|
| `http://servidor/compare/` | Frontend Angular |
| `http://servidor/compare/compare_php/` | Backend PHP (raíz, health check) |
| `http://servidor/compare/compare_php/api/*` | Endpoints REST |

## Capas del sistema

### 1. Presentación (Angular)

- **`AppComponent`** — shell: header de navegación, `<router-outlet>`, toast global
- **`CompareComponent`** — página principal: formularios + resultados tabulados
- **`HistoryComponent`** — lista de comparaciones con dialog de detalle
- **`ConnectionFormComponent`** — panel reutilizable de credenciales + test
- **`DiffTableComponent`** — tabla PrimeNG con diferencias expandibles por acordeón
- **`SqlViewerComponent`** — visor de SQL con highlight.js, copy y download

### 2. Servicios Angular

- **`ApiService`** — thin wrapper sobre `HttpClient`, apunta a `environment.apiBaseUrl`
- **`environment.ts`** — configura `apiBaseUrl = '/compare/compare_php'`

### 3. API PHP

- **`index.php`** — carga `.env_cfg`, configura CORS, hace autoload de `lib/`, enruta
- **`api/*.php`** — handlers de un solo propósito, muy delgados (sólo I/O)

### 4. Lógica de dominio (lib/)

- **`Database`** — pool de conexiones PDO MySQL + singleton SQLite
- **`SchemaExtractor`** — queries a `INFORMATION_SCHEMA` + `SHOW CREATE`
- **`SchemaComparator`** — diff estructural puro (sin I/O)
- **`ScriptGenerator`** — genera texto SQL documentado (sin I/O)
- **`HistoryManager`** — CRUD sobre SQLite (bootstrap de schema incluido)

### 5. Persistencia

| Store | Tecnología | Propósito |
|-------|-----------|-----------|
| Bases a comparar | MySQL (externas) | Solo lectura — nunca se modifica |
| Historial | SQLite (archivo local) | Escritura — `backend/history/history.sqlite` |

## Consideraciones de seguridad

> Esta herramienta está diseñada para **uso interno** (red local / VPN). Por eso no implementa autenticación.

- Las credenciales MySQL viajan en el body del POST (HTTPS en producción)
- El backend nunca ejecuta DDL ni modifica las bases comparadas — solo `SELECT` sobre `INFORMATION_SCHEMA`
- El script SQL generado es texto plano; el usuario decide si aplicarlo
- La base SQLite de historial contiene las credenciales de host/dbname (sin contraseñas — no se persisten)
