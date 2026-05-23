<?php
declare(strict_types=1);

/**
 * Database — lightweight PDO connection factory.
 * Uses a keyed connection cache to avoid duplicate connections.
 */
class Database
{
    private static array $pool = [];

    /**
     * Return a PDO connection for MySQL given a config array:
     *   host, port, dbname, user, password
     */
    public static function connect(array $cfg): PDO
    {
        if (!extension_loaded('pdo_mysql')) {
            throw new PDOException("La extensión de PHP 'pdo_mysql' no está instalada o habilitada en este sistema. Por favor instala php-mysqlnd (ej. 'sudo dnf install php-mysqlnd' o 'sudo apt-get install php-mysql').");
        }

        $key = md5(serialize($cfg));
        if (!isset(self::$pool[$key])) {
            $timeout = (int)($_ENV['DB_CONNECT_TIMEOUT'] ?? 10);
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                $cfg['host']   ?? 'localhost',
                $cfg['port']   ?? 3306,
                $cfg['dbname'] ?? ''
            );
            self::$pool[$key] = new PDO(
                $dsn,
                $cfg['user']     ?? '',
                $cfg['password'] ?? '',
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                    PDO::ATTR_TIMEOUT            => $timeout,
                ]
            );
        }
        return self::$pool[$key];
    }

    /** Test connectivity — returns ['success'=>bool, 'version'=>string, 'message'=>string] */
    public static function test(array $cfg): array
    {
        try {
            $pdo  = self::connect($cfg);
            $ver  = $pdo->query('SELECT VERSION() AS v')->fetchColumn();
            return ['success' => true, 'version' => $ver, 'message' => 'Conexión exitosa'];
        } catch (PDOException $e) {
            return ['success' => false, 'version' => null, 'message' => $e->getMessage()];
        }
    }

    /** Return a PDO connection to the local SQLite history database. */
    public static function sqlite(): PDO
    {
        static $sqlite = null;
        if ($sqlite === null) {
            $path = $_ENV['HISTORY_DB_PATH'] ?? __DIR__ . '/../history/history.sqlite';
            // Resolve relative paths from backend root
            if (!str_starts_with($path, '/')) {
                $path = realpath(__DIR__ . '/..') . '/' . ltrim($path, './');
            }
            $dir = dirname($path);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            $sqlite = new PDO('sqlite:' . $path, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $sqlite->exec('PRAGMA journal_mode=WAL');
            HistoryManager::ensureSchema($sqlite);
        }
        return $sqlite;
    }

    /** Parse and execute a multi-query SQL migration script on a MySQL connection. */
    public static function executeScript(PDO $pdo, string $script): array
    {
        $lines = explode("\n", $script);
        $delimiter = ';';
        $currentStmt = '';
        $executedCount = 0;

        foreach ($lines as $line) {
            $trimmed = trim($line);
            
            // Skip comments
            if (str_starts_with($trimmed, '--') || str_starts_with($trimmed, '#')) {
                continue;
            }
            
            if ($trimmed === '') {
                continue;
            }

            // Check for DELIMITER statement (e.g. DELIMITER $$)
            if (preg_match('/^delimiter\s+(.+)$/i', $trimmed, $matches)) {
                $delimiter = trim($matches[1]);
                continue;
            }

            $currentStmt .= $line . "\n";

            // If line ends with active delimiter
            if (str_ends_with($trimmed, $delimiter)) {
                $sql = trim($currentStmt);
                if (str_ends_with($sql, $delimiter)) {
                    $sql = substr($sql, 0, -strlen($delimiter));
                }
                $sql = trim($sql);

                if ($sql !== '') {
                    try {
                        $pdo->exec($sql);
                        $executedCount++;
                    } catch (PDOException $e) {
                        return [
                            'success' => false,
                            'executed_statements' => $executedCount,
                            'error' => $e->getMessage(),
                            'statement' => $sql
                        ];
                    }
                }
                $currentStmt = '';
            }
        }

        // Run any leftover statement in the buffer
        $sql = trim($currentStmt);
        if ($sql !== '') {
            try {
                $pdo->exec($sql);
                $executedCount++;
            } catch (PDOException $e) {
                return [
                    'success' => false,
                    'executed_statements' => $executedCount,
                    'error' => $e->getMessage(),
                    'statement' => $sql
                ];
            }
        }

        return [
            'success' => true,
            'executed_statements' => $executedCount
        ];
    }
}
