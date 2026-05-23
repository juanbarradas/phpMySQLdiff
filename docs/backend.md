# API REST — Backend PHP

Base URL: `http://servidor/compare/compare_php`

Todos los endpoints responden con `Content-Type: application/json; charset=UTF-8`.
Los errores retornan un objeto `{ "error": "mensaje descriptivo" }` con el código HTTP apropiado.

---

## Health Check

### `GET /api/health`

Verifica que el servidor PHP está activo.

**Response 200**
```json
{ "status": "ok", "php": "8.2.0" }
```

---

## Conexiones

### `POST /api/test-connection`

Prueba si es posible conectarse a una base de datos MySQL con las credenciales proporcionadas.

**Request body**
```json
{
  "connection": {
    "host":     "localhost",
    "port":     3306,
    "dbname":   "mi_base",
    "user":     "root",
    "password": "secreto"
  }
}
```

| Campo | Tipo | Requerido | Default |
|-------|------|-----------|---------|
| `host` | string | ✅ | — |
| `port` | int | ❌ | `3306` |
| `dbname` | string | ✅ | — |
| `user` | string | ❌ | `""` |
| `password` | string | ❌ | `""` |

**Response 200 — éxito**
```json
{
  "success": true,
  "version": "8.0.32",
  "message": "Connection successful"
}
```

**Response 200 — fallo de credenciales**
```json
{
  "success": false,
  "version": null,
  "message": "SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'"
}
```

**Response 400 — datos incompletos**
```json
{ "error": "host and dbname are required" }
```

---

## Comparación

### `POST /api/compare`

Extrae la estructura de ambas bases de datos, las compara y genera el script de migración.

> ⚠️ Esta operación puede tomar varios segundos en bases de datos con muchas tablas.

**Request body**
```json
{
  "origin": {
    "host": "localhost",
    "port": 3306,
    "dbname": "db_produccion",
    "user": "reader",
    "password": "pass1"
  },
  "dest": {
    "host": "localhost",
    "port": 3306,
    "dbname": "db_desarrollo",
    "user": "reader",
    "password": "pass2"
  }
}
```

**Response 200**
```json
{
  "history_id": 42,
  "summary": {
    "total_changes": 7,
    "tables": {
      "added":    2,
      "removed":  0,
      "modified": 3,
      "equal":    15,
      "total":    20
    },
    "views":      { "added": 1, "removed": 0, "modified": 1, "equal": 2, "total": 4 },
    "functions":  { "added": 0, "removed": 0, "modified": 0, "equal": 3, "total": 3 },
    "procedures": { "added": 0, "removed": 0, "modified": 0, "equal": 1, "total": 1 },
    "triggers":   { "added": 0, "removed": 0, "modified": 0, "equal": 2, "total": 2 }
  },
  "diff": {
    "tables": {
      "usuarios": {
        "name":   "usuarios",
        "status": "modified",
        "changes": [
          {
            "type":   "column",
            "action": "added",
            "name":   "telefono",
            "detail": {
              "COLUMN_TYPE": "varchar(20)",
              "IS_NULLABLE": "YES",
              "COLUMN_DEFAULT": null,
              "EXTRA": "",
              "COLUMN_COMMENT": "Teléfono de contacto"
            }
          },
          {
            "type":   "index",
            "action": "added",
            "name":   "idx_email",
            "detail": {
              "name":    "idx_email",
              "unique":  true,
              "type":    "BTREE",
              "columns": [{ "column": "email", "sub_part": null, "seq": 1 }]
            }
          }
        ]
      },
      "auditorias": {
        "name":   "auditorias",
        "status": "added",
        "changes": []
      }
    },
    "views":      { ... },
    "functions":  { ... },
    "procedures": { ... },
    "triggers":   { ... }
  },
  "script": "-- MySQL Schema Migration Script\n-- Generated : 2026-05-23 ..."
}
```

**Valores posibles de `status`**

| Valor | Significado |
|-------|-------------|
| `added` | Existe en origen, NO en destino → requiere `CREATE` |
| `removed` | Existe en destino, NO en origen → candidato a `DROP` (con advertencia) |
| `modified` | Existe en ambos pero con diferencias → requiere `ALTER`/`REPLACE` |
| `equal` | Idéntico en ambos → no requiere acción |

**Tipos de change item (`type` + `action`)**

| type | action | Descripción |
|------|--------|-------------|
| `column` | `added` | Columna nueva en origen |
| `column` | `removed` | Columna solo en destino |
| `column` | `modified` | Columna con diferencias (tipo, nullable, default, extra, comment, collation) |
| `index` | `added` / `removed` / `modified` | Índice diferente |
| `foreign_key` | `added` / `removed` / `modified` | FK diferente |
| `option` | `modified` | Opción de tabla (ENGINE, COLLATION, COMMENT) |

**Response 400**
```json
{ "error": "origin: host and dbname are required" }
```

**Response 502**
```json
{ "error": "Could not connect: SQLSTATE[HY000] [2002] Connection refused" }
```

---

## Historial

### `GET /api/history`

Lista las comparaciones almacenadas, ordenadas de más reciente a más antigua.

**Query params**

| Param | Tipo | Default | Máximo |
|-------|------|---------|--------|
| `limit` | int | 20 | 100 |
| `offset` | int | 0 | — |

**Response 200**
```json
{
  "total": 35,
  "items": [
    {
      "id":          42,
      "created_at":  "2026-05-23 14:30:00",
      "origin_host": "localhost",
      "origin_db":   "db_produccion",
      "dest_host":   "localhost",
      "dest_db":     "db_desarrollo",
      "summary": {
        "total_changes": 7,
        "tables":      { "added": 2, "removed": 0, "modified": 3, "equal": 15, "total": 20 },
        "views":       { "added": 1, "removed": 0, "modified": 1, "equal": 2,  "total": 4 },
        "functions":   { "added": 0, "removed": 0, "modified": 0, "equal": 3,  "total": 3 },
        "procedures":  { "added": 0, "removed": 0, "modified": 0, "equal": 1,  "total": 1 },
        "triggers":    { "added": 0, "removed": 0, "modified": 0, "equal": 2,  "total": 2 }
      }
    }
  ]
}
```

> El listado **no incluye** el `diff` completo ni el `script` para mantener las respuestas ligeras.

---

### `GET /api/history/{id}`

Retorna la entrada completa de historial incluyendo el diff y el script SQL.

**Response 200**
```json
{
  "id":          42,
  "created_at":  "2026-05-23 14:30:00",
  "origin_host": "localhost",
  "origin_db":   "db_produccion",
  "dest_host":   "localhost",
  "dest_db":     "db_desarrollo",
  "summary":     { ... },
  "diff":        { ... },
  "script":      "-- SQL script completo..."
}
```

**Response 404**
```json
{ "error": "History entry not found" }
```

---

### `DELETE /api/history/{id}`

Elimina una entrada del historial.

**Response 200**
```json
{ "success": true, "deleted_id": 42 }
```

**Response 404**
```json
{ "error": "History entry not found" }
```

---

## Códigos de error HTTP

| Código | Uso |
|--------|-----|
| `200` | OK |
| `400` | Datos de entrada inválidos o incompletos |
| `404` | Recurso no encontrado |
| `405` | Método HTTP no permitido |
| `500` | Error interno del servidor (ver `APP_DEBUG` en `.env_cfg`) |
| `502` | No se pudo conectar a MySQL |
