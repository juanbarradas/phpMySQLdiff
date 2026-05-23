# Frontend Angular — Estructura y Componentes

## Stack

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| Angular | 17+ | Framework SPA (standalone components) |
| PrimeNG | 21 | UI components (tabla, tabs, dialog, accordion, toast…) |
| PrimeFlex | 3 | Grid y utilidades de layout CSS |
| PrimeIcons | 7 | Iconografía |
| highlight.js | 11 | Resaltado de sintaxis SQL |
| Google Fonts | — | Inter (UI) + JetBrains Mono (código) |

## Estructura de directorios

```
frontend/src/
├── app/
│   ├── app.ts                          # Componente raíz
│   ├── app.html                        # Shell: header nav + <router-outlet>
│   ├── app.scss                        # Estilos del shell
│   ├── app.config.ts                   # Providers: HttpClient, Animations, MessageService
│   ├── app.routes.ts                   # Rutas lazy-loaded
│   │
│   ├── core/
│   │   ├── models/
│   │   │   └── schema.model.ts         # Todas las interfaces TypeScript
│   │   └── services/
│   │       └── api.service.ts          # Wrapper de HttpClient para la API
│   │
│   ├── pages/
│   │   ├── compare/
│   │   │   ├── compare.component.ts
│   │   │   ├── compare.component.html
│   │   │   └── compare.component.scss
│   │   └── history/
│   │       ├── history.component.ts
│   │       ├── history.component.html
│   │       └── history.component.scss
│   │
│   └── shared/
│       └── components/
│           ├── connection-form/         # Panel de credenciales + test
│           ├── diff-table/              # Tabla de diferencias con acordeón
│           └── sql-viewer/              # Visor SQL con highlight.js
│
├── environments/
│   ├── environment.ts                   # Dev  — apiBaseUrl: '/compare/compare_php'
│   └── environment.prod.ts             # Prod — apiBaseUrl: '/compare/compare_php'
│
├── index.html                           # Punto de entrada HTML
├── main.ts                              # Bootstrap de Angular
└── styles.scss                          # Estilos globales y tokens de diseño
```

---

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | — | Redirige a `/compare` |
| `/compare` | `CompareComponent` | Página principal |
| `/history` | `HistoryComponent` | Historial de comparaciones |
| `/**` | — | Redirige a `/compare` |

Todas las rutas son **lazy-loaded** para minimizar el bundle inicial.

---

## Componentes

### `AppComponent` — Shell

Shell de la aplicación. Contiene:
- Header con navegación (Compare / History) con `routerLinkActive`
- `<router-outlet>` donde se renderizan las páginas
- `<p-toast>` para notificaciones globales
- Footer

```typescript
imports: [RouterOutlet, RouterLink, RouterLinkActive, Toast]
```

---

### `CompareComponent` — Página principal

**Archivo:** `src/app/pages/compare/`

Orquesta todo el flujo de comparación:

1. Renderiza dos `ConnectionFormComponent` (origen y destino)
2. Al recibir `testRequested`, llama a `ApiService.testConnection()` y devuelve el resultado a la forma correspondiente via `setTestResult()`
3. Al pulsar **Compare Databases**, llama a `ApiService.compare()` y muestra un `ProgressBar` indeterminado
4. Al recibir `CompareResult`, renderiza:
   - **Summary cards** con métricas por sección
   - **Tabs PrimeNG** (Tables / Views / Functions / Procedures / Triggers / SQL Script)

**Inputs de la API usados:**
- `POST /api/test-connection`
- `POST /api/compare`

**Estado interno:**

| Propiedad | Tipo | Propósito |
|-----------|------|-----------|
| `originConn` | `DbConnection` | Credenciales del origen |
| `destConn` | `DbConnection` | Credenciales del destino |
| `comparing` | `boolean` | Controla el spinner / deshabilita botón |
| `result` | `CompareResult \| null` | Resultado de la comparación |

---

### `HistoryComponent` — Historial

**Archivo:** `src/app/pages/history/`

- Carga paginada del historial (`GET /api/history`) al iniciar
- Muestra una `p-table` con: id, fecha, origen, destino, resumen de cambios, acciones
- Botón **👁 Ver detalle**: abre un `p-dialog` con tabs y carga el entry completo (`GET /api/history/{id}`)
- Botón **🗑 Eliminar**: muestra `p-confirmDialog` antes de llamar `DELETE /api/history/{id}`

---

### `ConnectionFormComponent` — Panel de conexión

**Archivo:** `src/app/shared/components/connection-form/`

Panel reutilizable para capturar credenciales de una base de datos MySQL.

**Inputs**

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `label` | string | `'Database'` | Título del panel |
| `icon` | string | `'pi-database'` | Icono PrimeIcons |
| `colorClass` | string | `'origin'` | `'origin'` (azul) o `'dest'` (violeta) |

**Outputs**

| Output | Tipo | Cuándo se emite |
|--------|------|----------------|
| `connectionChanged` | `DbConnection` | Al cambiar cualquier campo |
| `testRequested` | `DbConnection` | Al pulsar "Test Connection" |
| `testResult` | `ConnectionTestResult \| null` | Al recibir resultado del test |
| `formReady` | `ConnectionFormComponent` | En `ngOnInit`, expone la instancia al padre |

**Método público**
```typescript
setTestResult(result: ConnectionTestResult): void
// Llamado por el padre para actualizar el estado visual del test
```

**Estados del test**

| Estado | UI |
|--------|-----|
| `idle` | Sin indicador |
| `testing` | Botón con spinner |
| `ok` | Tag verde "Connected" + versión MySQL |
| `error` | Tag rojo + mensaje de error |

---

### `DiffTableComponent` — Tabla de diferencias

**Archivo:** `src/app/shared/components/diff-table/`

Muestra un listado de objetos con diferencias. Filtra automáticamente los items con `status === 'equal'`.

**Inputs**

| Input | Tipo | Descripción |
|-------|------|-------------|
| `items` | `TableDiff[] \| SimpleObjectDiff[]` | Lista de diferencias |
| `type` | `'table' \| 'simple'` | Tablas muestran el acordeón de cambios; simple muestra texto |
| `emptyMessage` | string | Mensaje cuando no hay diferencias |

**Para `type='table'`:** cada fila tiene un acordeón que expande y muestra todos los `ChangeItem` con:
- Tipo de cambio (column / index / foreign_key / option)
- Acción (added / removed / modified) con color
- Para columnas modificadas: diff inline con `<del>` → `<ins>`

**Para `type='simple'`:** vistas / funciones / procedures / triggers — muestra solo nombre, status y descripción textual.

---

### `SqlViewerComponent` — Visor SQL

**Archivo:** `src/app/shared/components/sql-viewer/`

Muestra el script SQL generado con resaltado de sintaxis.

**Input**

| Input | Tipo | Descripción |
|-------|------|-------------|
| `code` | string | El SQL a mostrar |

**Funcionalidades:**
- Resaltado con **highlight.js** (lenguaje `sql`, tema `github-dark`)
- Botón **Copy** — usa `navigator.clipboard.writeText()`, tooltip cambia a "Copied!" por 2 segundos
- Botón **Download .sql** — genera un `Blob` y descarga como `migration_YYYY-MM-DD.sql`
- Scroll vertical limitado a 600px

---

## ApiService

**Archivo:** `src/app/core/services/api.service.ts`

Thin wrapper sobre `HttpClient`. La URL base se toma de `environment.apiBaseUrl`.

```typescript
testConnection(connection: DbConnection): Observable<ConnectionTestResult>
compare(origin: DbConnection, dest: DbConnection): Observable<CompareResult>
getHistory(limit?: number, offset?: number): Observable<HistoryListResult>
getHistoryEntry(id: number): Observable<HistoryDetail>
deleteHistoryEntry(id: number): Observable<{ success: boolean }>
```

---

## Sistema de diseño

### Variables CSS (Design Tokens)

Definidas en `styles.scss`:

```scss
--bg-base:        #0d1117   // Fondo base (negro GitHub)
--bg-surface:     #161b22   // Tarjetas, paneles
--bg-elevated:    #1c2128   // Elementos elevados
--accent:         #58a6ff   // Azul primario (GitHub blue)
--success:        #3fb950   // Verde
--danger:         #f85149   // Rojo
--warning:        #d29922   // Ámbar
--added-color:    #3fb950   // Diferencias: nuevo
--removed-color:  #f85149   // Diferencias: eliminado
--modified-color: #d29922   // Diferencias: modificado
```

### Tipografía

| Fuente | Uso |
|--------|-----|
| `Inter` | Toda la UI |
| `JetBrains Mono` | Código SQL, nombres de tablas/columnas, versiones MySQL |

### Clases utilitarias

| Clase | Uso |
|-------|-----|
| `.badge-added` | Pill verde "Added" |
| `.badge-removed` | Pill rojo "Removed" |
| `.badge-modified` | Pill ámbar "Modified" |
| `.badge-equal` | Pill gris "Equal" |
| `.page-title` | H1 de página |
| `.page-subtitle` | Subtítulo de página |
| `.section-title` | Título de sección |

---

## Configuración de ambiente

`src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/compare/compare_php'
};
```

La URL del backend es **relativa** para funcionar con cualquier hostname en producción. En desarrollo se asume que un proxy o el servidor sirve ambas rutas.

### Proxy para desarrollo local

Si el frontend corre en `localhost:4200` y el backend en `localhost:8080`, crear `frontend/proxy.conf.json`:

```json
{
  "/compare/compare_php": {
    "target": "http://localhost:8080",
    "secure": false,
    "pathRewrite": { "^/compare/compare_php": "" }
  }
}
```

Y arrancar con:
```bash
npm start -- --proxy-config proxy.conf.json
```
