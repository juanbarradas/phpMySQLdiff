<?php
declare(strict_types=1);

// Log the incoming request and raw body
Logger::logRequest('/api/test-connection');

$raw  = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];
$cfg  = $body['connection'] ?? [];

if (empty($cfg['host']) || empty($cfg['dbname'])) {
    http_response_code(400);
    $errorMsg = 'host y dbname son requeridos';
    
    // Log the validation failure
    Logger::log("Validation failed on /api/test-connection: $errorMsg. Received connection: " . json_encode($cfg));
    
    echo json_encode([
        'error' => $errorMsg,
        'received_connection' => $cfg,
        'raw_body' => $raw
    ]);
    exit;
}

$result = Database::test($cfg);
echo json_encode($result);
