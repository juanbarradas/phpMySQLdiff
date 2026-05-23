<?php
declare(strict_types=1);

/** DELETE /api/history/{id} — removes a single history entry. */

$id = (int)($_REQUEST['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$db      = Database::sqlite();
$deleted = HistoryManager::delete($db, $id);

if (!$deleted) {
    http_response_code(404);
    echo json_encode(['error' => 'Entrada de historial no encontrada']);
    exit;
}

echo json_encode(['success' => true, 'deleted_id' => $id]);
