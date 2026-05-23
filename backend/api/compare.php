<?php
declare(strict_types=1);

/**
 * POST /api/compare
 * Body: { origin: {host,port,dbname,user,password}, dest: {host,port,dbname,user,password} }
 */

// Log the incoming request and raw body
Logger::logRequest('/api/compare');

$raw     = file_get_contents('php://input');
$body    = json_decode($raw, true) ?? [];
$origCfg = $body['origin'] ?? [];
$destCfg = $body['dest']   ?? [];

// ── Validate input ────────────────────────────────────────────────────────────
foreach (['origin' => $origCfg, 'dest' => $destCfg] as $side => $cfg) {
    if (empty($cfg['host']) || empty($cfg['dbname'])) {
        http_response_code(400);
        $errorMsg = "$side: host y dbname son requeridos";
        
        // Log the validation failure
        Logger::log("Validation failed on /api/compare: $errorMsg. Received body: $raw");
        
        echo json_encode([
            'error' => $errorMsg,
            'received_origin' => $origCfg,
            'received_dest' => $destCfg,
            'raw_body' => $raw
        ]);
        exit;
    }
}

// ── Connect ───────────────────────────────────────────────────────────────────
try {
    $origPdo = Database::connect($origCfg);
    $destPdo = Database::connect($destCfg);
} catch (PDOException $e) {
    http_response_code(502);
    echo json_encode(['error' => 'No se pudo conectar: ' . $e->getMessage()]);
    exit;
}

// ── Extract schemas ───────────────────────────────────────────────────────────
$origExtractor = new SchemaExtractor($origPdo, $origCfg['dbname']);
$destExtractor = new SchemaExtractor($destPdo, $destCfg['dbname']);

$origSchema = $origExtractor->extract();
$destSchema = $destExtractor->extract();

// ── Compare ───────────────────────────────────────────────────────────────────
$comparator = new SchemaComparator();
$diff       = $comparator->compare($origSchema, $destSchema);
$summary    = SchemaComparator::buildSummary($diff);
$diff['summary'] = $summary;

// ── Generate SQL script ───────────────────────────────────────────────────────
$ignoreFks = isset($body['ignore_fks']) ? (bool)$body['ignore_fks'] : true;
$generator = new ScriptGenerator();
$script    = $generator->generate($diff, $origCfg['dbname'], $destCfg['dbname'], $ignoreFks);

// ── Save to history ───────────────────────────────────────────────────────────
$historyDb = Database::sqlite();
$historyId = HistoryManager::save($historyDb, [
    'origin_host' => $origCfg['host'],
    'origin_db'   => $origCfg['dbname'],
    'dest_host'   => $destCfg['host'],
    'dest_db'     => $destCfg['dbname'],
    'summary'     => $summary,
    'diff'        => $diff,
    'script'      => $script,
]);

// ── Return response ───────────────────────────────────────────────────────────
$jsonResponse = json_encode([
    'history_id' => $historyId,
    'summary'    => $summary,
    'diff'       => $diff,
    'script'     => $script,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_INVALID_UTF8_SUBSTITUTE);

if ($jsonResponse === false) {
    throw new Exception("Error al codificar la respuesta a JSON: " . json_last_error_msg());
}

echo $jsonResponse;
