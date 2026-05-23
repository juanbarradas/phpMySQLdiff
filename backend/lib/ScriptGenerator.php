<?php
declare(strict_types=1);

/**
 * ScriptGenerator — converts a SchemaComparator diff into a well-documented
 * SQL migration script that can be applied to the destination database to
 * bring it in line with the origin database.
 */
class ScriptGenerator
{
    private array $lines = [];
    private string $destDb;
    private string $origDb;

    public function generate(array $diff, string $origDb, string $destDb, bool $ignoreFks = true): string
    {
        $this->lines  = [];
        $this->origDb = $origDb;
        $this->destDb = $destDb;

        $ts = date('Y-m-d H:i:s');
        $this->header("Script de Migración de Esquema MySQL");
        $this->comment("Generado  : $ts");
        $this->comment("BD Origen : $origDb");
        $this->comment("BD Destino: $destDb");
        $this->comment("Aplicar a : $destDb");
        $this->blank();
        $this->comment("IMPORTANTE: Revisa cada sentencia antes de ejecutarla.");
        $this->comment("Las sentencias marcadas con [REVISIÓN MANUAL] pueden causar pérdida de datos.");
        $this->blank();
        
        if ($ignoreFks) {
            $this->line("SET FOREIGN_KEY_CHECKS = 0;");
            $this->blank();
        }

        $this->genTables($diff['tables']   ?? []);
        $this->genViews($diff['views']      ?? []);
        $this->genRoutines($diff['functions']  ?? [], 'FUNCTION');
        $this->genRoutines($diff['procedures'] ?? [], 'PROCEDURE');
        $this->genTriggers($diff['triggers']   ?? []);

        if ($ignoreFks) {
            $this->blank();
            $this->line("SET FOREIGN_KEY_CHECKS = 1;");
        }
        
        $this->blank();
        $this->header("Fin del script de migración");

        return implode("\n", $this->lines);
    }

    // ── Tables ───────────────────────────────────────────────────────────────

    private function genTables(array $tables): void
    {
        $added    = array_filter($tables, fn($t) => $t['status'] === 'added');
        $modified = array_filter($tables, fn($t) => $t['status'] === 'modified');
        $removed  = array_filter($tables, fn($t) => $t['status'] === 'removed');

        $added    = $this->topoSortTables($added, 'orig', false);
        $modified = $this->topoSortTables($modified, 'orig', false);
        $removed  = $this->topoSortTables($removed, 'dest', true);

        if ($added) {
            $this->header("NUEVAS TABLAS — CREAR");
            foreach ($added as $t) {
                $this->comment("La tabla `{$t['name']}` existe en el origen pero no en el destino.");
                $this->line("-- TODO: Pega la sentencia completa CREATE TABLE para `{$t['name']}` aquí.");
                $this->line("-- Puedes obtenerla con: SHOW CREATE TABLE `{$this->origDb}`.`{$t['name']}`;");
                $this->blank();
            }
        }

        if ($modified) {
            $this->header("TABLAS MODIFICADAS — ALTER");
            foreach ($modified as $t) {
                $this->genAlterTable($t);
            }
        }

        if ($removed) {
            $this->header("TABLAS SÓLO EN DESTINO — [REVISIÓN MANUAL]");
            foreach ($removed as $t) {
                $this->comment("[REVISIÓN MANUAL] La tabla `{$t['name']}` no existe en el origen.");
                $this->comment("Descomenta la línea de abajo sólo si estás seguro de que debe ser eliminada:");
                $this->line("-- DROP TABLE IF EXISTS `{$t['name']}`;");
                $this->blank();
            }
        }
    }

    private function genAlterTable(array $table): void
    {
        $name    = $table['name'];
        $changes = $table['changes'];
        if (empty($changes)) return;

        $this->comment("Tabla: `$name`");
        $stmts = [];

        // Order: drop FKs first, then drop indexes, modify columns, add columns,
        //        add indexes, add FKs
        $order = ['foreign_key_drop', 'index_drop', 'column_modify', 'column_add',
                  'column_remove', 'index_add', 'foreign_key_add', 'option'];

        $buckets = array_fill_keys($order, []);

        foreach ($changes as $c) {
            $t = $c['type'];
            $a = $c['action'];
            $key = match(true) {
                $t === 'foreign_key' && $a === 'removed'  => 'foreign_key_drop',
                $t === 'foreign_key' && in_array($a,['added','modified']) => 'foreign_key_add',
                $t === 'index'       && $a === 'removed'  => 'index_drop',
                $t === 'index'       && in_array($a,['added','modified']) => 'index_add',
                $t === 'column'      && $a === 'added'    => 'column_add',
                $t === 'column'      && $a === 'modified' => 'column_modify',
                $t === 'column'      && $a === 'removed'  => 'column_remove',
                $t === 'option'                           => 'option',
                default                                   => 'option',
            };
            $buckets[$key][] = $c;
        }

        foreach ($order as $bkey) {
            foreach ($buckets[$bkey] as $c) {
                $sql = $this->changeToAlterClause($name, $c);
                if ($sql) {
                    $stmts[] = $sql;
                }
            }
        }

        if ($stmts) {
            $this->line("ALTER TABLE `$name`");
            foreach ($stmts as $i => $s) {
                $comma = ($i < count($stmts) - 1) ? ',' : ';';
                $this->line("  $s$comma");
            }
        }
        $this->blank();
    }

    private function changeToAlterClause(string $table, array $c): string
    {
        $t = $c['type'];
        $a = $c['action'];
        $n = $c['name'];
        $d = $c['detail'] ?? [];

        if ($t === 'column') {
            if ($a === 'added') {
                $def = $this->colDef($d);
                return "ADD COLUMN `$n` $def";
            }
            if ($a === 'modified') {
                $def = $this->colDef($d);
                return "MODIFY COLUMN `$n` $def";
            }
            if ($a === 'removed') {
                return "-- DROP COLUMN `$n`  /* [REVISIÓN MANUAL] */";
            }
        }

        if ($t === 'index') {
            if ($a === 'removed' || $a === 'modified') {
                return "DROP INDEX `$n`";
            }
            if ($a === 'added') {
                $cols  = implode('`, `', array_column($d['columns'], 'column'));
                $uq    = $d['unique'] ? 'UNIQUE ' : '';
                $itype = ($d['type'] !== 'BTREE') ? " USING {$d['type']}" : '';
                return "ADD {$uq}INDEX `$n` (`$cols`)$itype";
            }
        }

        if ($t === 'foreign_key') {
            if ($a === 'removed' || $a === 'modified') {
                return "DROP FOREIGN KEY `$n`";
            }
            if ($a === 'added' || $a === 'modified') {
                $cols    = implode('`, `', $d['columns']);
                $refs    = implode('`, `', $d['ref_columns']);
                $refTbl  = $d['ref_table'];
                $onDel   = $d['on_delete'] ?? 'RESTRICT';
                $onUpd   = $d['on_update'] ?? 'RESTRICT';
                return "ADD CONSTRAINT `$n` FOREIGN KEY (`$cols`) "
                    . "REFERENCES `$refTbl` (`$refs`) "
                    . "ON DELETE $onDel ON UPDATE $onUpd";
            }
        }

        if ($t === 'option') {
            if ($n === 'engine')    return "ENGINE = {$c['orig_value']}";
            if ($n === 'collation') return "CONVERT TO CHARACTER SET utf8mb4 COLLATE {$c['orig_value']}";
            if ($n === 'comment')   return "COMMENT = '" . addslashes($c['orig_value']) . "'";
        }

        return '';
    }

    private function colDef(array $col): string
    {
        $type    = $col['COLUMN_TYPE'] ?? 'VARCHAR(255)';
        $null    = ($col['IS_NULLABLE'] ?? 'YES') === 'NO' ? 'NOT NULL' : 'NULL';
        $default = '';
        if (array_key_exists('COLUMN_DEFAULT', $col) && $col['COLUMN_DEFAULT'] !== null) {
            $dv = $col['COLUMN_DEFAULT'];
            $default = in_array(strtoupper($dv), ['CURRENT_TIMESTAMP', 'NULL'])
                ? " DEFAULT $dv"
                : " DEFAULT '" . addslashes($dv) . "'";
        }
        $extra   = $col['EXTRA'] ? ' ' . strtoupper($col['EXTRA']) : '';
        $comment = $col['COLUMN_COMMENT']
            ? " COMMENT '" . addslashes($col['COLUMN_COMMENT']) . "'"
            : '';
        return "$type $null$default$extra$comment";
    }

    // ── Views ────────────────────────────────────────────────────────────────

    private function genViews(array $views): void
    {
        $removed  = array_filter($views, fn($v) => $v['status'] === 'removed');
        $toCreate = array_filter($views, fn($v) => in_array($v['status'], ['added', 'modified']));

        $removed  = $this->topoSortViews($removed, 'dest', true);
        $toCreate = $this->topoSortViews($toCreate, 'orig', false);

        if ($removed) {
            $this->header("VISTAS — ELIMINAR");
            foreach ($removed as $v) {
                $name = $v['name'];
                $this->comment("[REVISIÓN MANUAL] La vista `$name` sólo está en el destino.");
                $this->line("-- DROP VIEW IF EXISTS `$name`;");
                $this->blank();
            }
        }

        if ($toCreate) {
            $this->header("VISTAS — CREAR O REEMPLAZAR");
            foreach ($toCreate as $v) {
                $name = $v['name'];
                $action = $v['status'] === 'added' ? 'nueva — crear en destino' : 'modificada';
                $this->comment("La vista `$name` es $action.");
                $ddl = $v['orig']['ddl'] ?? '';
                if ($ddl) {
                    $this->line("DROP VIEW IF EXISTS `$name`;");
                    $ddl = $this->sanitizeDdl($ddl);
                    if (!str_ends_with($ddl, ';')) {
                        $ddl .= ';';
                    }
                    $this->line($ddl);
                } else {
                    $this->line("-- CREATE OR REPLACE VIEW `$name` AS ... (obtener del origen)");
                }
                $this->blank();
            }
        }
    }

    // ── Routines ─────────────────────────────────────────────────────────────

    private function genRoutines(array $routines, string $type): void
    {
        $relevant = array_filter($routines, fn($r) => $r['status'] !== 'equal');
        if (!$relevant) return;

        $this->header(strtoupper($type) . "S");
        foreach ($relevant as $r) {
            $name = $r['name'];
            if ($r['status'] === 'removed') {
                $this->comment("[REVISIÓN MANUAL] $type `$name` sólo en destino.");
                $this->line("-- DROP $type IF EXISTS `$name`;");
            } else {
                $action = $r['status'] === 'added' ? 'nuevo' : 'modificado';
                $this->comment("$type `$name` es $action — reemplazar en destino.");
                $ddl = $r['orig']['ddl'] ?? '';
                if ($ddl) {
                    $this->line("DROP $type IF EXISTS `$name`;");
                    $this->line("DELIMITER \$\$");
                    $this->line($this->sanitizeDdl($ddl) . " \$\$");
                    $this->line("DELIMITER ;");
                } else {
                    $this->line("-- $type `$name` DDL no disponible; obtener del origen.");
                }
            }
            $this->blank();
        }
    }

    // ── Triggers ─────────────────────────────────────────────────────────────

    private function genTriggers(array $triggers): void
    {
        $relevant = array_filter($triggers, fn($t) => $t['status'] !== 'equal');
        if (!$relevant) return;

        $this->header("TRIGGERS");
        foreach ($relevant as $t) {
            $name = $t['name'];
            if ($t['status'] === 'removed') {
                $this->comment("[REVISIÓN MANUAL] Trigger `$name` sólo en destino.");
                $this->line("-- DROP TRIGGER IF EXISTS `$name`;");
            } else {
                $action = $t['status'] === 'added' ? 'nuevo' : 'modificado';
                $this->comment("Trigger `$name` es $action.");
                $ddl = $t['orig']['ddl'] ?? '';
                if ($ddl) {
                    $this->line("DROP TRIGGER IF EXISTS `$name`;");
                    $this->line("DELIMITER \$\$");
                    $this->line($this->sanitizeDdl($ddl) . " \$\$");
                    $this->line("DELIMITER ;");
                } else {
                    $this->line("-- Trigger `$name` DDL no disponible.");
                }
            }
            $this->blank();
        }
    }

    // ── Dependency sorting ───────────────────────────────────────────────────

    private function topoSortTables(array $items, string $schemaKey, bool $reverse): array
    {
        $graph = [];
        foreach ($items as $name => $item) {
            $graph[$name] = [];
            $fks = $item[$schemaKey]['foreign_keys'] ?? [];
            foreach ($fks as $fk) {
                $ref = $fk['ref_table'];
                if (isset($items[$ref]) && $ref !== $name) {
                    $graph[$name][] = $ref;
                }
            }
        }
        return $this->doTopoSort($items, $graph, $reverse);
    }

    private function topoSortViews(array $items, string $schemaKey, bool $reverse): array
    {
        $graph = [];
        foreach ($items as $name => $item) {
            $graph[$name] = [];
            $def = $item[$schemaKey]['definition'] ?? '';
            foreach ($items as $otherName => $otherItem) {
                if ($name === $otherName) continue;
                if (preg_match('/\b' . preg_quote($otherName, '/') . '\b/i', $def)) {
                    $graph[$name][] = $otherName;
                }
            }
        }
        return $this->doTopoSort($items, $graph, $reverse);
    }

    private function doTopoSort(array $items, array $graph, bool $reverse): array
    {
        $result = [];
        $visited = [];
        $visiting = [];

        $visit = function($name) use (&$visit, &$visited, &$visiting, $graph, &$result, $items) {
            if (isset($visited[$name])) return;
            if (isset($visiting[$name])) return; // break cycle gracefully

            $visiting[$name] = true;
            foreach ($graph[$name] as $dep) {
                $visit($dep);
            }
            unset($visiting[$name]);
            $visited[$name] = true;
            $result[] = $items[$name];
        };

        foreach ($items as $name => $item) {
            $visit($name);
        }

        if ($reverse) {
            return array_reverse($result);
        }
        return $result;
    }

    // ── Formatting helpers ────────────────────────────────────────────────────

    private function sanitizeDdl(string $ddl): string
    {
        $ddl = trim($ddl);
        if ($ddl === '') {
            return '';
        }

        // 1. Remove DEFINER clause
        $definerPattern = '/DEFINER\s*=\s*(?:`[^`\n]+`|\'[^\'\n]+\'|"[^"\n]+"|[^\s]+)@(?:`[^`\n]+`|\'[^\'\n]+\'|"[^"\n]+"|[^\s]+)/i';
        $ddl = preg_replace($definerPattern, '', $ddl);

        // 2. Remove SQL SECURITY DEFINER or SQL SECURITY INVOKER
        $securityPattern = '/SQL SECURITY\s+(?:DEFINER|INVOKER)/i';
        $ddl = preg_replace($securityPattern, '', $ddl);

        // 3. Clean up multiple spaces
        $ddl = preg_replace('/\s+/', ' ', $ddl);
        $ddl = trim($ddl);

        // 4. Replace origin database references with destination database
        $orig = $this->origDb;
        $dest = $this->destDb;
        
        if (!empty($orig) && !empty($dest) && $orig !== $dest) {
            $origQuote = preg_quote($orig, '/');
            // Matches `origDb`. or origDb. preceded by a non-word char or start of string
            $pattern = '/(?<=\W|^)(`?)' . $origQuote . '\1\./i';
            
            $ddl = preg_replace_callback(
                $pattern,
                fn($m) => $m[1] . $dest . $m[1] . '.',
                $ddl
            );
        }

        return $ddl;
    }

    private function header(string $text): void
    {
        $bar = str_repeat('-', 70);
        $this->lines[] = "-- $bar";
        $this->lines[] = "-- $text";
        $this->lines[] = "-- $bar";
    }

    private function comment(string $text): void
    {
        $this->lines[] = "-- $text";
    }

    private function line(string $sql): void
    {
        $this->lines[] = $sql;
    }

    private function blank(): void
    {
        $this->lines[] = '';
    }
}
