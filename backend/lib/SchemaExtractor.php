<?php
declare(strict_types=1);

/**
 * SchemaExtractor — queries INFORMATION_SCHEMA to build a full structural
 * snapshot of a MySQL database: tables, columns, indexes, foreign keys,
 * views, functions, stored procedures, and triggers.
 */
class SchemaExtractor
{
    public function __construct(
        private readonly PDO    $pdo,
        private readonly string $dbname
    ) {}

    // ── API Pública ───────────────────────────────────────────────────────────

    public function extract(): array
    {
        return [
            'dbname'     => $this->dbname,
            'tables'     => $this->tables(),
            'views'      => $this->views(),
            'functions'  => $this->routines('FUNCTION'),
            'procedures' => $this->routines('PROCEDURE'),
            'triggers'   => $this->triggers(),
        ];
    }

    // ── Tablas ───────────────────────────────────────────────────────────────

    private function tables(): array
    {
        $rows = $this->query("
            SELECT TABLE_NAME, ENGINE, TABLE_COLLATION, TABLE_COMMENT, CREATE_OPTIONS
            FROM   INFORMATION_SCHEMA.TABLES
            WHERE  TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
            ORDER  BY TABLE_NAME
        ", [$this->dbname]);

        $tables = [];
        foreach ($rows as $r) {
            $name = $r['TABLE_NAME'];
            $tables[$name] = [
                'name'         => $name,
                'engine'       => $r['ENGINE'],
                'collation'    => $r['TABLE_COLLATION'],
                'comment'      => $r['TABLE_COMMENT'],
                'columns'      => $this->columns($name),
                'indexes'      => $this->indexes($name),
                'foreign_keys' => $this->foreignKeys($name),
                'ddl'          => $this->showCreate('TABLE', $name),
            ];
        }
        return $tables;
    }

    private function columns(string $table): array
    {
        $rows = $this->query("
            SELECT COLUMN_NAME, ORDINAL_POSITION, COLUMN_DEFAULT, IS_NULLABLE,
                   DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION,
                   NUMERIC_SCALE, DATETIME_PRECISION, COLUMN_TYPE,
                   COLUMN_KEY, EXTRA, COLUMN_COMMENT,
                   CHARACTER_SET_NAME, COLLATION_NAME
            FROM   INFORMATION_SCHEMA.COLUMNS
            WHERE  TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ORDER  BY ORDINAL_POSITION
        ", [$this->dbname, $table]);

        $cols = [];
        foreach ($rows as $r) {
            $cols[$r['COLUMN_NAME']] = $r;
        }
        return $cols;
    }

    private function indexes(string $table): array
    {
        $rows = $this->query("
            SELECT INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX,
                   COLUMN_NAME, INDEX_TYPE, SUB_PART, INDEX_COMMENT
            FROM   INFORMATION_SCHEMA.STATISTICS
            WHERE  TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ORDER  BY INDEX_NAME, SEQ_IN_INDEX
        ", [$this->dbname, $table]);

        $indexes = [];
        foreach ($rows as $r) {
            $iname = $r['INDEX_NAME'];
            if (!isset($indexes[$iname])) {
                $indexes[$iname] = [
                    'name'       => $iname,
                    'unique'     => $r['NON_UNIQUE'] == 0,
                    'type'       => $r['INDEX_TYPE'],
                    'comment'    => $r['INDEX_COMMENT'],
                    'columns'    => [],
                ];
            }
            $indexes[$iname]['columns'][] = [
                'column'   => $r['COLUMN_NAME'],
                'sub_part' => $r['SUB_PART'],
                'seq'      => $r['SEQ_IN_INDEX'],
            ];
        }
        return $indexes;
    }

    private function foreignKeys(string $table): array
    {
        $rows = $this->query("
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
        ", [$this->dbname, $table]);

        $fks = [];
        foreach ($rows as $r) {
            $cname = $r['CONSTRAINT_NAME'];
            if (!isset($fks[$cname])) {
                $fks[$cname] = [
                    'name'            => $cname,
                    'columns'         => [],
                    'ref_table'       => $r['REFERENCED_TABLE_NAME'],
                    'ref_columns'     => [],
                    'on_update'       => $r['UPDATE_RULE'],
                    'on_delete'       => $r['DELETE_RULE'],
                ];
            }
            $fks[$cname]['columns'][]     = $r['COLUMN_NAME'];
            $fks[$cname]['ref_columns'][] = $r['REFERENCED_COLUMN_NAME'];
        }
        return $fks;
    }

    // ── Vistas ────────────────────────────────────────────────────────────────

    private function views(): array
    {
        $rows = $this->query("
            SELECT TABLE_NAME, VIEW_DEFINITION, CHECK_OPTION, IS_UPDATABLE, DEFINER
            FROM   INFORMATION_SCHEMA.VIEWS
            WHERE  TABLE_SCHEMA = ?
            ORDER  BY TABLE_NAME
        ", [$this->dbname]);

        $views = [];
        foreach ($rows as $r) {
            $name = $r['TABLE_NAME'];
            $views[$name] = [
                'name'       => $name,
                'definition' => $r['VIEW_DEFINITION'],
                'updatable'  => $r['IS_UPDATABLE'],
                'definer'    => $r['DEFINER'],
                'ddl'        => $this->showCreate('VIEW', $name),
            ];
        }
        return $views;
    }

    // ── Rutinas (Funciones y Procedimientos) ────────────────────────────────────

    private function routines(string $type): array
    {
        $rows = $this->query("
            SELECT ROUTINE_NAME, ROUTINE_TYPE, DATA_TYPE, DTD_IDENTIFIER,
                   ROUTINE_DEFINITION, IS_DETERMINISTIC, SQL_DATA_ACCESS,
                   SECURITY_TYPE, DEFINER, ROUTINE_COMMENT
            FROM   INFORMATION_SCHEMA.ROUTINES
            WHERE  ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = ?
            ORDER  BY ROUTINE_NAME
        ", [$this->dbname, $type]);

        $routines = [];
        foreach ($rows as $r) {
            $name = $r['ROUTINE_NAME'];
            $routines[$name] = [
                'name'            => $name,
                'type'            => $r['ROUTINE_TYPE'],
                'return_type'     => $r['DTD_IDENTIFIER'],
                'definition'      => $r['ROUTINE_DEFINITION'],
                'deterministic'   => $r['IS_DETERMINISTIC'],
                'sql_data_access' => $r['SQL_DATA_ACCESS'],
                'definer'         => $r['DEFINER'],
                'comment'         => $r['ROUTINE_COMMENT'],
                'ddl'             => $this->showCreate(
                    $type === 'FUNCTION' ? 'FUNCTION' : 'PROCEDURE', $name
                ),
            ];
        }
        return $routines;
    }

    // ── Triggers ─────────────────────────────────────────────────────────────

    private function triggers(): array
    {
        $rows = $this->query("
            SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE,
                   ACTION_TIMING, ACTION_STATEMENT, DEFINER
            FROM   INFORMATION_SCHEMA.TRIGGERS
            WHERE  TRIGGER_SCHEMA = ?
            ORDER  BY EVENT_OBJECT_TABLE, TRIGGER_NAME
        ", [$this->dbname]);

        $triggers = [];
        foreach ($rows as $r) {
            $name = $r['TRIGGER_NAME'];
            $triggers[$name] = [
                'name'       => $name,
                'event'      => $r['EVENT_MANIPULATION'],
                'table'      => $r['EVENT_OBJECT_TABLE'],
                'timing'     => $r['ACTION_TIMING'],
                'statement'  => $r['ACTION_STATEMENT'],
                'definer'    => $r['DEFINER'],
                'ddl'        => $this->showCreate('TRIGGER', $name),
            ];
        }
        return $triggers;
    }

    // ── Auxiliares ──────────────────────────────────────────────────────────────

    private function query(string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    private function showCreate(string $type, string $name): string
    {
        try {
            $stmt = $this->pdo->query("SHOW CREATE $type `$name`");
            $row  = $stmt->fetch();
            // The DDL column name varies by object type
            return $row["Create $type"]
                ?? $row['Create View']
                ?? $row['Create Function']
                ?? $row['Create Procedure']
                ?? $row['Create Trigger']
                ?? $row['SQL Original Statement']
                ?? '';
        } catch (Throwable) {
            return '';
        }
    }
}
