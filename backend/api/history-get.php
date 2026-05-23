<?php
declare(strict_types=1);

/** GET /api/history/{id} — returns full comparison entry including diff and script. */

$id = (int)($_REQUEST['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$db  = Database::sqlite();
$row = HistoryManager::get($db, $id);

if (!$row) {
    http_response_code(404);
    echo json_encode(['error' => 'Entrada de historial no encontrada']);
    exit;
}

echo json_encode($row);
