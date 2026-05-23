<?php
declare(strict_types=1);

/**
 * HistoryManager — stores comparison results in a local SQLite database.
 * Each entry contains metadata + the full diff/script as JSON.
 */
class HistoryManager
{
    // ── Schema bootstrap ─────────────────────────────────────────────────────

    public static function ensureSchema(PDO $db): void
    {
        $db->exec("
            CREATE TABLE IF NOT EXISTS comparisons (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at  TEXT    NOT NULL,
                origin_host TEXT    NOT NULL,
                origin_db   TEXT    NOT NULL,
                dest_host   TEXT    NOT NULL,
                dest_db     TEXT    NOT NULL,
                summary     TEXT    NOT NULL,  -- JSON
                diff        TEXT    NOT NULL,  -- JSON (full diff)
                script      TEXT    NOT NULL   -- SQL script
            )
        ");
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    /** Persiste un resultado de comparación; elimina entradas antiguas si es necesario. */
    public static function save(PDO $db, array $data): int
    {
        $stmt = $db->prepare("
            INSERT INTO comparisons
                (created_at, origin_host, origin_db, dest_host, dest_db, summary, diff, script)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            date('Y-m-d H:i:s'),
            $data['origin_host'] ?? '',
            $data['origin_db']   ?? '',
            $data['dest_host']   ?? '',
            $data['dest_db']     ?? '',
            json_encode($data['summary'] ?? [], JSON_UNESCAPED_UNICODE),
            json_encode($data['diff']    ?? [], JSON_UNESCAPED_UNICODE),
            $data['script']      ?? '',
        ]);
        $id = (int)$db->lastInsertId();
        self::prune($db);
        return $id;
    }

    /** Retorna la lista paginada (los más nuevos primero) — sólo metadatos, sin diff. */
    public static function list(PDO $db, int $limit = 50, int $offset = 0): array
    {
        $total = (int)$db->query("SELECT COUNT(*) FROM comparisons")->fetchColumn();
        $stmt  = $db->prepare("
            SELECT id, created_at, origin_host, origin_db, dest_host, dest_db, summary
            FROM   comparisons
            ORDER  BY id DESC
            LIMIT  ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['summary'] = json_decode($r['summary'], true);
        }
        return ['total' => $total, 'items' => $rows];
    }

    /** Retorna una sola entrada incluyendo el diff completo + script. */
    public static function get(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare("SELECT * FROM comparisons WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) return null;
        $row['summary'] = json_decode($row['summary'], true);
        $row['diff']    = json_decode($row['diff'],    true);
        return $row;
    }

    /** Elimina una sola entrada. Retorna true si fue encontrada y eliminada. */
    public static function delete(PDO $db, int $id): bool
    {
        $stmt = $db->prepare("DELETE FROM comparisons WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    /** Elimina las entradas más antiguas más allá del límite configurado MAX_HISTORY_ENTRIES. */
    private static function prune(PDO $db): void
    {
        $max = (int)($_ENV['MAX_HISTORY_ENTRIES'] ?? 100);
        $db->exec("
            DELETE FROM comparisons
            WHERE id NOT IN (
                SELECT id FROM comparisons ORDER BY id DESC LIMIT $max
            )
        ");
    }
}
