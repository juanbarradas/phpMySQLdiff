<?php
declare(strict_types=1);

/**
 * SchemaComparator — compares two extracted schemas (origin vs destination)
 * and produces a structured diff. The diff indicates what exists in origin
 * but is missing or different in destination (i.e. what needs to change in
 * destination to match origin).
 */
class SchemaComparator
{
    // Posibles estados para cualquier objeto
    const ADDED    = 'added';    // en origen, NO en destino → necesita CREATE
    const REMOVED  = 'removed';  // en destino, NO en origen  → candidato a DROP
    const MODIFIED = 'modified'; // en ambos, pero diferente  → necesita ALTER/REPLACE
    const EQUAL    = 'equal';    // idéntico — no requiere acción

    public function compare(array $origin, array $dest): array
    {
        return [
            'tables'     => $this->compareTables($origin['tables'],     $dest['tables']),
            'views'      => $this->compareSimple($origin['views'],      $dest['views'],      'view'),
            'functions'  => $this->compareSimple($origin['functions'],  $dest['functions'],  'function'),
            'procedures' => $this->compareSimple($origin['procedures'], $dest['procedures'], 'procedure'),
            'triggers'   => $this->compareSimple($origin['triggers'],   $dest['triggers'],   'trigger'),
            'summary'    => [], // llenado por quien llama después de esta llamada
        ];
    }

    // ── Tables ───────────────────────────────────────────────────────────────

    private function compareTables(array $orig, array $dest): array
    {
        $result = [];
        $allNames = array_unique(array_merge(array_keys($orig), array_keys($dest)));

        foreach ($allNames as $name) {
            if (!isset($orig[$name])) {
                $result[$name] = ['name' => $name, 'status' => self::REMOVED, 'changes' => [], 'orig' => null, 'dest' => $dest[$name]];
                continue;
            }
            if (!isset($dest[$name])) {
                $result[$name] = ['name' => $name, 'status' => self::ADDED, 'changes' => [], 'orig' => $orig[$name], 'dest' => null];
                continue;
            }
            $changes = $this->diffTable($orig[$name], $dest[$name]);
            $result[$name] = [
                'name'    => $name,
                'status'  => empty($changes) ? self::EQUAL : self::MODIFIED,
                'changes' => $changes,
                'orig'    => $orig[$name],
                'dest'    => $dest[$name],
            ];
        }
        return $result;
    }

    private function diffTable(array $orig, array $dest): array
    {
        $changes = [];

        // ── Columns ──────────────────────────────────────────────────────────
        $allCols = array_unique(array_merge(
            array_keys($orig['columns']),
            array_keys($dest['columns'])
        ));
        foreach ($allCols as $col) {
            if (!isset($orig['columns'][$col])) {
                $changes[] = ['type' => 'column', 'action' => self::REMOVED, 'name' => $col, 'detail' => $dest['columns'][$col]];
            } elseif (!isset($dest['columns'][$col])) {
                $changes[] = ['type' => 'column', 'action' => self::ADDED, 'name' => $col, 'detail' => $orig['columns'][$col]];
            } else {
                $diff = $this->diffColumn($orig['columns'][$col], $dest['columns'][$col]);
                if (!empty($diff)) {
                    $changes[] = ['type' => 'column', 'action' => self::MODIFIED, 'name' => $col,
                                  'detail' => $orig['columns'][$col], 'diff' => $diff];
                }
            }
        }

        // ── Indexes ───────────────────────────────────────────────────────────
        $allIdx = array_unique(array_merge(array_keys($orig['indexes']), array_keys($dest['indexes'])));
        foreach ($allIdx as $idx) {
            if ($idx === 'PRIMARY') continue; // manejado a través de columnas
            if (!isset($orig['indexes'][$idx])) {
                $changes[] = ['type' => 'index', 'action' => self::REMOVED, 'name' => $idx, 'detail' => $dest['indexes'][$idx]];
            } elseif (!isset($dest['indexes'][$idx])) {
                $changes[] = ['type' => 'index', 'action' => self::ADDED, 'name' => $idx, 'detail' => $orig['indexes'][$idx]];
            } else {
                if (!$this->indexesEqual($orig['indexes'][$idx], $dest['indexes'][$idx])) {
                    $changes[] = ['type' => 'index', 'action' => self::MODIFIED, 'name' => $idx,
                                  'detail' => $orig['indexes'][$idx], 'dest_detail' => $dest['indexes'][$idx]];
                }
            }
        }

        // ── Foreign Keys ─────────────────────────────────────────────────────
        $allFks = array_unique(array_merge(array_keys($orig['foreign_keys']), array_keys($dest['foreign_keys'])));
        foreach ($allFks as $fk) {
            if (!isset($orig['foreign_keys'][$fk])) {
                $changes[] = ['type' => 'foreign_key', 'action' => self::REMOVED, 'name' => $fk, 'detail' => $dest['foreign_keys'][$fk]];
            } elseif (!isset($dest['foreign_keys'][$fk])) {
                $changes[] = ['type' => 'foreign_key', 'action' => self::ADDED, 'name' => $fk, 'detail' => $orig['foreign_keys'][$fk]];
            } else {
                if (!$this->fksEqual($orig['foreign_keys'][$fk], $dest['foreign_keys'][$fk])) {
                    $changes[] = ['type' => 'foreign_key', 'action' => self::MODIFIED, 'name' => $fk,
                                  'detail' => $orig['foreign_keys'][$fk], 'dest_detail' => $dest['foreign_keys'][$fk]];
                }
            }
        }

        // ── Table-level options ───────────────────────────────────────────────
        foreach (['engine', 'collation', 'comment'] as $opt) {
            $ov = $orig[$opt] ?? '';
            $dv = $dest[$opt] ?? '';
            if (strtolower((string)$ov) !== strtolower((string)$dv)) {
                $changes[] = ['type' => 'option', 'action' => self::MODIFIED, 'name' => $opt,
                              'orig_value' => $ov, 'dest_value' => $dv];
            }
        }

        return $changes;
    }

    private function diffColumn(array $orig, array $dest): array
    {
        $fields = ['COLUMN_TYPE', 'IS_NULLABLE', 'COLUMN_DEFAULT', 'EXTRA', 'COLUMN_COMMENT', 'COLLATION_NAME'];
        $diff = [];
        foreach ($fields as $f) {
            $ov = $orig[$f] ?? null;
            $dv = $dest[$f] ?? null;
            if ((string)$ov !== (string)$dv) {
                $diff[$f] = ['orig' => $ov, 'dest' => $dv];
            }
        }
        return $diff;
    }

    private function indexesEqual(array $a, array $b): bool
    {
        if ($a['unique'] !== $b['unique'] || $a['type'] !== $b['type']) return false;
        $colsA = array_column($a['columns'], 'column');
        $colsB = array_column($b['columns'], 'column');
        return $colsA === $colsB;
    }

    private function fksEqual(array $a, array $b): bool
    {
        return $a['ref_table']   === $b['ref_table']
            && $a['columns']     === $b['columns']
            && $a['ref_columns'] === $b['ref_columns']
            && $a['on_update']   === $b['on_update']
            && $a['on_delete']   === $b['on_delete'];
    }

    // ── Views / Routines / Triggers (simple DDL comparison) ──────────────────

    private function compareSimple(array $orig, array $dest, string $objType): array
    {
        $result = [];
        $allNames = array_unique(array_merge(array_keys($orig), array_keys($dest)));

        foreach ($allNames as $name) {
            if (!isset($orig[$name])) {
                $result[$name] = ['name' => $name, 'status' => self::REMOVED,  'orig' => null,        'dest' => $dest[$name]];
            } elseif (!isset($dest[$name])) {
                $result[$name] = ['name' => $name, 'status' => self::ADDED,    'orig' => $orig[$name], 'dest' => null];
            } else {
                $same = $this->definitionsEqual($orig[$name], $dest[$name], $objType);
                $result[$name] = [
                    'name'   => $name,
                    'status' => $same ? self::EQUAL : self::MODIFIED,
                    'orig'   => $orig[$name],
                    'dest'   => $dest[$name],
                ];
            }
        }
        return $result;
    }

    private function definitionsEqual(array $orig, array $dest, string $type): bool
    {
        $normalize = fn(string $s) => preg_replace('/\s+/', ' ', trim($s));

        $key = match($type) {
            'view'      => 'definition',
            'trigger'   => 'statement',
            default     => 'definition',  // function / procedure
        };

        return $normalize($orig[$key] ?? '') === $normalize($dest[$key] ?? '');
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    public static function buildSummary(array $diff): array
    {
        $count = function(array $items, string $status) {
            return count(array_filter($items, fn($i) => $i['status'] === $status));
        };

        $sections = ['tables', 'views', 'functions', 'procedures', 'triggers'];
        $summary  = ['total_changes' => 0];

        foreach ($sections as $s) {
            $items = $diff[$s] ?? [];
            $summary[$s] = [
                'added'    => $count($items, self::ADDED),
                'removed'  => $count($items, self::REMOVED),
                'modified' => $count($items, self::MODIFIED),
                'equal'    => $count($items, self::EQUAL),
                'total'    => count($items),
            ];
            $summary['total_changes'] +=
                $summary[$s]['added'] + $summary[$s]['removed'] + $summary[$s]['modified'];
        }
        return $summary;
    }
}
