<?php
declare(strict_types=1);

/** POST /api/execute-script — connects to target DB and executes the SQL script. */

$raw  = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];

$connCfg = $body['connection'] ?? [];
$script  = $body['script'] ?? '';

if (empty($connCfg['host']) || empty($connCfg['dbname']) || empty($script)) {
    http_response_code(400);
    echo json_encode(['error' => 'los detalles de conexión y el script son requeridos']);
    exit;
}

Logger::log("[POST] /api/execute-script | Dest DB: " . ($connCfg['dbname'] ?? 'unknown'));

try {
    $pdo = Database::connect($connCfg);
} catch (PDOException $e) {
    Logger::log("Connection error on execute-script: " . $e->getMessage());
    http_response_code(502);
    echo json_encode(['error' => 'No se pudo conectar: ' . $e->getMessage()]);
    exit;
}

$res = Database::executeScript($pdo, $script);

if (!$res['success']) {
    Logger::log("Script execution error on " . $connCfg['dbname'] . ": " . ($res['error'] ?? ''));
    http_response_code(500);
    echo json_encode($res);
    exit;
}

Logger::log("Script execution successful on " . $connCfg['dbname'] . ". Statements executed: " . $res['executed_statements']);
echo json_encode($res);
