# Lógica de Extracción y Comparación de Schemas

## SchemaExtractor

**Archivo:** `backend/lib/SchemaExtractor.php`

Recibe una conexión PDO activa y el nombre de la base de datos.  
El método público `extract()` retorna un array con la estructura completa:

```php
$extractor = new SchemaExtractor($pdo, 'mi_base');
$schema = $extractor->extract();

// Estructura retornada:
[
  'dbname'     => 'mi_base',
  'tables'     => [ 'tabla1' => [...], 'tabla2' => [...] ],
  'views'      => [ 'vista1' => [...] ],
  'functions'  => [ 'func1'  => [...] ],
  'procedures' => [ 'proc1'  => [...] ],
  'triggers'   => [ 'trig1'  => [...] ],
]
```

---

### Extracción de Tablas

#### Metadatos de tabla
Query sobre `INFORMATION_SCHEMA.TABLES`:

```sql
SELECT TABLE_NAME, ENGINE, TABLE_COLLATION, TABLE_COMMENT, CREATE_OPTIONS
FROM   INFORMATION_SCHEMA.TABLES
WHERE  TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
ORDER  BY TABLE_NAME
```

#### Columnas
Query sobre `INFORMATION_SCHEMA.COLUMNS`:

```sql
SELECT COLUMN_NAME, ORDINAL_POSITION, COLUMN_DEFAULT, IS_NULLABLE,
       DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION,
       NUMERIC_SCALE, DATETIME_PRECISION, COLUMN_TYPE,
       COLUMN_KEY, EXTRA, COLUMN_COMMENT,
       CHARACTER_SET_NAME, COLLATION_NAME
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_SCHEMA = ? AND TABLE_NAME = ?
ORDER  BY ORDINAL_POSITION
```

**Campos que se comparan al hacer diff:**

| Campo | Significado |
|-------|-------------|
| `COLUMN_TYPE` | Tipo completo (`varchar(255)`, `int(11) unsigned`, etc.) |
| `IS_NULLABLE` | `YES` / `NO` |
| `COLUMN_DEFAULT` | Valor por defecto (`null` si no tiene) |
| `EXTRA` | `auto_increment`, `on update CURRENT_TIMESTAMP`, etc. |
| `COLUMN_COMMENT` | Comentario de la columna |
| `COLLATION_NAME` | Collation de la columna |

#### Índices
Query sobre `INFORMATION_SCHEMA.STATISTICS`:

```sql
SELECT INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX,
       COLUMN_NAME, INDEX_TYPE, SUB_PART, INDEX_COMMENT
FROM   INFORMATION_SCHEMA.STATISTICS
WHERE  TABLE_SCHEMA = ? AND TABLE_NAME = ?
ORDER  BY INDEX_NAME, SEQ_IN_INDEX
```

Los índices se agrupan por `INDEX_NAME`. La clave primaria (`PRIMARY`) se excluye del diff de índices ya que se maneja implícitamente via columnas.

#### Claves foráneas (Foreign Keys)
Join entre `KEY_COLUMN_USAGE` y `REFERENTIAL_CONSTRAINTS`:

```sql
SELECT kcu.CONSTRAINT_NAME, kcu.COLUMN_NAME, kcu.ORDINAL_POSITION,
       kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME,
       rc.UPDATE_RULE, rc.DELETE_RULE
FROM   INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
JOIN   INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
         ON  rc.CONSTRAINT_NAME   = kcu.CONSTRAINT_NAME
         AND rc.CONSTRAINT_SCHEMA = kcu.TABLE_SCHEMA
WHERE  kcu.TABLE_SCHEMA = ? AND kcu.TABLE_NAME = ?
  AND  kcu.REFERENCED_TABLE_NAME IS NOT NULL
ORDER  BY kcu.CONSTRAINT_NAME, kcu.ORDINAL_POSITION
```

**Campos que se comparan:**
- Columnas de la FK
- Tabla referenciada
- Columnas referenciadas
- `ON DELETE` y `ON UPDATE` rules

#### DDL completo
```sql
SHOW CREATE TABLE `nombre_tabla`
```
Se guarda para poder generar `CREATE TABLE` completo cuando la tabla es nueva.

---

### Extracción de Vistas

```sql
SELECT TABLE_NAME, VIEW_DEFINITION, CHECK_OPTION, IS_UPDATABLE, DEFINER
FROM   INFORMATION_SCHEMA.VIEWS
WHERE  TABLE_SCHEMA = ?
ORDER  BY TABLE_NAME
```

DDL completo: `SHOW CREATE VIEW \`nombre\``

---

### Extracción de Rutinas (Functions y Procedures)

```sql
SELECT ROUTINE_NAME, ROUTINE_TYPE, DATA_TYPE, DTD_IDENTIFIER,
       ROUTINE_DEFINITION, IS_DETERMINISTIC, SQL_DATA_ACCESS,
       SECURITY_TYPE, DEFINER, ROUTINE_COMMENT
FROM   INFORMATION_SCHEMA.ROUTINES
WHERE  ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = ?   -- 'FUNCTION' o 'PROCEDURE'
ORDER  BY ROUTINE_NAME
```

DDL completo: `SHOW CREATE FUNCTION/PROCEDURE \`nombre\``

---

### Extracción de Triggers

```sql
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE,
       ACTION_TIMING, ACTION_STATEMENT, DEFINER
FROM   INFORMATION_SCHEMA.TRIGGERS
WHERE  TRIGGER_SCHEMA = ?
ORDER  BY EVENT_OBJECT_TABLE, TRIGGER_NAME
```

DDL completo: `SHOW CREATE TRIGGER \`nombre\``

---

## SchemaComparator

**Archivo:** `backend/lib/SchemaComparator.php`

Clase pura (sin I/O). Recibe dos arrays de schema (origen y destino) y retorna un diff.

### Constantes de estado

```php
const ADDED    = 'added';    // En origen, no en destino → CREATE
const REMOVED  = 'removed';  // En destino, no en origen → DROP (con advertencia)
const MODIFIED = 'modified'; // En ambos, con diferencias → ALTER/REPLACE
const EQUAL    = 'equal';    // Idénticos — ninguna acción necesaria
```

### Algoritmo de comparación de tablas

```
para cada tabla en (union de nombres origen + destino):
  si no existe en origen   → REMOVED
  si no existe en destino  → ADDED
  si existe en ambos:
    changes = []
    ├── comparar columna a columna
    │     si columna no existe en origen   → changes += {column, REMOVED}
    │     si columna no existe en destino  → changes += {column, ADDED}
    │     si existe en ambos:
    │       diff = comparar campos relevantes
    │       si diff no vacío → changes += {column, MODIFIED, diff}
    │
    ├── comparar índice a índice (excepto PRIMARY)
    │     lógica similar
    │
    ├── comparar FK a FK
    │     lógica similar
    │
    └── comparar opciones (engine, collation, comment)
          si valor difiere → changes += {option, MODIFIED}

  si changes vacío → EQUAL
  si changes no vacío → MODIFIED
```

### Comparación de vistas / rutinas / triggers

Se normaliza el texto de la definición (`preg_replace('/\s+/', ' ', trim($def))`) y se compara como string.

> La normalización de espacios en blanco evita falsos positivos por diferencias de formato.

### `buildSummary(array $diff): array`

Método estático que itera el diff y cuenta por sección y estado:

```php
$summary = SchemaComparator::buildSummary($diff);
// Retorna:
[
  'total_changes' => 7,
  'tables' => ['added'=>2, 'removed'=>0, 'modified'=>3, 'equal'=>15, 'total'=>20],
  'views'  => [...],
  ...
]
```

---

## Limitaciones conocidas

| Limitación | Motivo |
|-----------|--------|
| Los `DEFINER` no se comparan | En migraciones entre servidores los users suelen diferir |
| `AUTO_INCREMENT` actual no se compara | El valor del contador es dato, no estructura |
| Particiones de tabla | No implementado — usar `SHOW CREATE TABLE` para comparar el DDL completo |
| Permisos (`GRANT`) | Fuera del scope — son datos de seguridad, no estructura |
| Tipos de datos equivalentes | `INT` vs `INT(11)` en MySQL 8+ son iguales, pero se comparan como string |
