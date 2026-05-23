<?php
declare(strict_types=1);

class Logger
{
    /**
     * Write a message to the debug log.
     */
    public static function log(string $message): void
    {
        $logFile = __DIR__ . '/../history/debug.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        $timestamp = date('Y-m-d H:i:s');
        @file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
    }

    /**
     * Log request diagnostics.
     */
    public static function logRequest(string $endpoint): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
        $raw = file_get_contents('php://input');
        // Truncate raw body in log if too long, to prevent log bloating
        $displayRaw = (strlen($raw) > 2000) ? substr($raw, 0, 2000) . '... (truncated)' : $raw;
        self::log("[$method] $endpoint | Body: $displayRaw");
    }
}
