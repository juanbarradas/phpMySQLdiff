# Script SQL Generado

## Descripción

**`ScriptGenerator`** (`backend/lib/ScriptGenerator.php`) convierte el diff producido por `SchemaComparator` en un script SQL de texto plano, documentado con comentarios, listo para revisar y aplicar sobre la base de datos destino.

---

## Estructura del script

```sql
-- ----------------------------------------------------------------------
-- MySQL Schema Migration Script
-- ----------------------------------------------------------------------
-- Generated : 2026-05-23 14:30:00
-- Origin DB : db_produccion
-- Dest DB   : db_desarrollo
-- Apply to  : db_desarrollo
--
-- IMPORTANT: Review each statement before executing.
-- Statements marked [MANUAL REVIEW] may cause data loss.

SET FOREIGN_KEY_CHECKS = 0;

-- ======== SECCIÓN 1: NUEVAS TABLAS ========

-- ======== SECCIÓN 2: TABLAS MODIFICADAS ========

-- ======== SECCIÓN 3: TABLAS SOLO EN DESTINO ========

-- ======== SECCIÓN 4: VISTAS ========

-- ======== SECCIÓN 5: FUNCIONES ========

-- ======== SECCIÓN 6: PROCEDURES ========

-- ======== SECCIÓN 7: TRIGGERS ========

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------
-- End of migration script
-- ----------------------------------------------------------------------
```

---

## Generación por tipo de objeto

### Tablas nuevas (`status: added`)

```sql
-- Table `auditorias` exists in origin but not in destination.
-- TODO: Paste the full CREATE TABLE statement for `auditorias` here.
-- You can obtain it with: SHOW CREATE TABLE `db_produccion`.`auditorias`;
```

> Se muestra el hint en lugar del DDL completo para forzar revisión manual antes de ejecutar.

### Tablas modificadas (`status: modified`)

Los cambios se ordenan de forma segura antes de generar el `ALTER TABLE`:

1. `DROP FOREIGN KEY` (primero, para liberar dependencias)
2. `DROP INDEX`
3. `MODIFY COLUMN` (columnas existentes)
4. `ADD COLUMN` (columnas nuevas)
5. `DROP COLUMN` (comentado con [MANUAL REVIEW])
6. `ADD INDEX`
7. `ADD CONSTRAINT ... FOREIGN KEY` (último, después de que las columnas existen)
8. Opciones de tabla (ENGINE, COLLATION, COMMENT)

**Ejemplo:**
```sql
-- Table: `usuarios`
ALTER TABLE `usuarios`
  DROP FOREIGN KEY `fk_rol`,
  DROP INDEX `idx_email_old`,
  MODIFY COLUMN `nombre` varchar(150) NOT NULL DEFAULT '' COMMENT 'Nombre completo',
  ADD COLUMN `telefono` varchar(20) NULL,
  -- DROP COLUMN `campo_obsoleto`  /* [MANUAL REVIEW] */,
  ADD UNIQUE INDEX `idx_email` (`email`),
  ADD CONSTRAINT `fk_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ENGINE = InnoDB;
```

**Definición de columna generada:**
```
COLUMN_TYPE IS_NULLABLE [DEFAULT valor] [EXTRA] [COMMENT 'texto']
```

Ejemplos:
```sql
varchar(100) NOT NULL DEFAULT '' COMMENT 'Email'
int NOT NULL AUTO_INCREMENT
timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
decimal(10,2) NOT NULL DEFAULT '0.00'
```

### Tablas solo en destino (`status: removed`)

```sql
-- [MANUAL REVIEW] Table `tabla_vieja` does not exist in origin.
-- Uncomment the line below only if you are sure it should be removed:
-- DROP TABLE IF EXISTS `tabla_vieja`;
```

> Siempre comentado. El usuario debe revisar y descomentar explícitamente.

---

### Vistas

**Nueva o modificada:**
```sql
-- View `reporte_ventas` is new — create it in destination.
CREATE OR REPLACE VIEW `reporte_ventas` AS
SELECT ... (DDL completo del origen);
```

**Solo en destino:**
```sql
-- [MANUAL REVIEW] View `vista_antigua` only in destination.
-- DROP VIEW IF EXISTS `vista_antigua`;
```

---

### Funciones y Stored Procedures

**Nueva o modificada:**
```sql
-- FUNCTION `calcular_iva` is modified — replace in destination.
DROP FUNCTION IF EXISTS `calcular_iva`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` FUNCTION `calcular_iva`(...) RETURNS decimal(10,2)
    DETERMINISTIC
BEGIN
  ...
END $$
DELIMITER ;
```

**Solo en destino:**
```sql
-- [MANUAL REVIEW] FUNCTION `funcion_vieja` only in destination.
-- DROP FUNCTION IF EXISTS `funcion_vieja`;
```

---

### Triggers

**Nuevo o modificado:**
```sql
-- Trigger `after_insert_venta` is new.
DROP TRIGGER IF EXISTS `after_insert_venta`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` TRIGGER `after_insert_venta`
AFTER INSERT ON `ventas` FOR EACH ROW
BEGIN
  ...
END $$
DELIMITER ;
```

---

## Convenciones de documentación en el script

| Patrón | Significado |
|--------|-------------|
| `-- [MANUAL REVIEW]` | Acción potencialmente destructiva — no ejecutar sin revisar |
| `-- TODO:` | El DDL debe obtenerse manualmente |
| `-- Section header ---` | Separador visual entre secciones |
| `SET FOREIGN_KEY_CHECKS = 0/1` | Enmarca todo el script para evitar errores de FK durante la migración |
| `DELIMITER $$` | Requerido para rutinas y triggers con cuerpo multi-statement |

---

## Orden de ejecución recomendado

1. Hacer **backup** de la base destino
2. Revisar el script completo de arriba a abajo
3. Identificar y descomentar/ajustar cualquier `[MANUAL REVIEW]`
4. Ejecutar en un ambiente de **staging** primero
5. Verificar integridad de datos
6. Aplicar en producción
