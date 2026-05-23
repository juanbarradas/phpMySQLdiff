<?php
declare(strict_types=1);

// Evitar salida de errores en el raw HTML/text de PHP que pueda romper la respuesta JSON API 
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Aumentar límites para bases de datos grandes
ini_set('memory_limit', '512M');
set_time_limit(300);

// ── Load .env_cfg ────────────────────────────────────────────────────────────
$envFile = __DIR__ . '/.env_cfg';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (!str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $_ENV[trim($k)] = trim($v);
    }
}

// ── CORS ─────────────────────────────────────────────────────────────────────
$origin = $_ENV['CORS_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Autoload lib classes ─────────────────────────────────────────────────────
foreach (glob(__DIR__ . '/lib/*.php') as $f) {
    require_once $f;
}

// ── Router ───────────────────────────────────────────────────────────────────
$raw  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = rtrim($_ENV['APP_BASE_PATH'] ?? '/mysqlcompare/compare_php', '/');
$path = '/' . ltrim(substr($raw, strlen($base)), '/');
$path = rtrim($path, '/') ?: '/';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Exact routes
    if ($method === 'POST' && $path === '/api/test-connection') {
        require __DIR__ . '/api/test-connection.php'; exit;
    }
    if ($method === 'POST' && $path === '/api/compare') {
        require __DIR__ . '/api/compare.php'; exit;
    }
    if ($method === 'POST' && $path === '/api/execute-script') {
        require __DIR__ . '/api/execute-script.php'; exit;
    }
    if ($method === 'GET' && $path === '/api/history') {
        require __DIR__ . '/api/history.php'; exit;
    }
    // Pattern: /api/history/{id}
    if (preg_match('#^/api/history/(\d+)$#', $path, $m)) {
        $_REQUEST['id'] = (int)$m[1];
        if ($method === 'GET') {
            require __DIR__ . '/api/history-get.php';
        } elseif ($method === 'DELETE') {
            require __DIR__ . '/api/history-delete.php';
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
        }
        exit;
    }
    // Health-check
    if ($method === 'GET' && $path === '/api/health') {
        echo json_encode(['status' => 'ok', 'php' => PHP_VERSION]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada', 'path' => $path]);
} catch (Throwable $e) {
    // Log the error details including the stack trace
    Logger::log("Error on route " . ($method ?? 'UNKNOWN') . " " . ($path ?? 'UNKNOWN') . ": " . $e->getMessage() . "\n" . $e->getTraceAsString());

    http_response_code(500);
    $debug = ($_ENV['APP_DEBUG'] ?? 'false') === 'true';
    echo json_encode([
        'error'   => 'Error interno del servidor',
        'message' => $debug ? $e->getMessage() : 'Ocurrió un error inesperado',
        'trace'   => $debug ? $e->getTraceAsString() : null,
    ]);
}
