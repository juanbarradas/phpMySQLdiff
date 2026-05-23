# Sistema de Historial

## Descripción

El historial almacena cada comparación realizada en una base de datos **SQLite local**, sin necesidad de un servidor de base de datos adicional. El archivo se crea automáticamente en el primer uso.

**Ubicación por defecto:** `backend/history/history.sqlite`  
Configurable via `.env_cfg`:
```ini
HISTORY_DB_PATH=./history/history.sqlite
MAX_HISTORY_ENTRIES=100
```

---

## Esquema de la base de datos SQLite

```sql
CREATE TABLE IF NOT EXISTS comparisons (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  TEXT    NOT NULL,     -- 'YYYY-MM-DD HH:MM:SS'
    origin_host TEXT    NOT NULL,
    origin_db   TEXT    NOT NULL,
    dest_host   TEXT    NOT NULL,
    dest_db     TEXT    NOT NULL,
    summary     TEXT    NOT NULL,     -- JSON del resumen (sin diff completo)
    diff        TEXT    NOT NULL,     -- JSON del diff completo
    script      TEXT    NOT NULL      -- SQL script como texto plano
);
```

> Las contraseñas **nunca se almacenan** en el historial — solo host y nombre de base de datos.

---

## HistoryManager

**Archivo:** `backend/lib/HistoryManager.php`

Clase estática con métodos CRUD sobre SQLite.

### `ensureSchema(PDO $db): void`
Llamado automáticamente al obtener la conexión SQLite. Crea la tabla si no existe (`CREATE TABLE IF NOT EXISTS`).

### `save(PDO $db, array $data): int`
Guarda una nueva comparación y retorna su `id`.

```php
$id = HistoryManager::save($db, [
    'origin_host' => 'localhost',
    'origin_db'   => 'db_prod',
    'dest_host'   => 'localhost',
    'dest_db'     => 'db_dev',
    'summary'     => $summary,   // array
    'diff'        => $diff,       // array
    'script'      => $script,     // string
]);
```

Después de guardar, invoca `prune()` automáticamente.

### `list(PDO $db, int $limit, int $offset): array`
Retorna metadata (sin `diff` ni `script`) paginada, ordenada por `id DESC`.

```php
$result = HistoryManager::list($db, 20, 0);
// ['total' => 35, 'items' => [...]]
```

### `get(PDO $db, int $id): ?array`
Retorna la entrada completa incluyendo `diff` (decodificado como array) y `script`.  
Retorna `null` si no existe.

### `delete(PDO $db, int $id): bool`
Elimina la entrada. Retorna `true` si fue encontrada y eliminada.

### `prune(PDO $db): void` *(privado)*
Mantiene el número de entradas dentro del límite configurado:

```sql
DELETE FROM comparisons
WHERE id NOT IN (
    SELECT id FROM comparisons ORDER BY id DESC LIMIT {MAX_HISTORY_ENTRIES}
)
```

---

## Conexión SQLite

La conexión se obtiene via `Database::sqlite()` (singleton):

```php
$db = Database::sqlite();
```

- Se usa `PRAGMA journal_mode=WAL` para mejor rendimiento con lecturas concurrentes
- El directorio del archivo se crea automáticamente si no existe
- Rutas relativas se resuelven desde el directorio raíz del backend

---

## Acceso desde el Frontend

El historial se accede vía los endpoints REST:

| Acción | Endpoint |
|--------|---------|
| Listar (metadata) | `GET /api/history?limit=20&offset=0` |
| Ver detalle completo | `GET /api/history/{id}` |
| Eliminar entrada | `DELETE /api/history/{id}` |

El frontend muestra el historial en la página `/history` con:
- Tabla paginada con resumen de cambios por comparación
- Botón "Ver detalle" → dialog con tabs idénticas a la página de comparación
- Botón "Eliminar" → confirmación antes de borrar

---

## Mantenimiento

### Ver el contenido del historial directamente

```bash
sqlite3 backend/history/history.sqlite

# Listar comparaciones
SELECT id, created_at, origin_db, dest_db FROM comparisons ORDER BY id DESC;

# Ver summary de la última
SELECT summary FROM comparisons ORDER BY id DESC LIMIT 1;

# Limpiar todo el historial
DELETE FROM comparisons;
```

### Backup del historial

El historial es un único archivo SQLite — copiarlo es suficiente para hacer backup:

```bash
cp backend/history/history.sqlite backup/history_$(date +%Y%m%d).sqlite
```

### Resetear el historial

```bash
rm backend/history/history.sqlite
# Se recreará automáticamente en la próxima comparación
```
