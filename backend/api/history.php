<?php
declare(strict_types=1);

/** GET /api/history — returns paginated list of past comparisons (metadata only). */

$limit  = max(1, min(100, (int)($_GET['limit']  ?? 20)));
$offset = max(0, (int)($_GET['offset'] ?? 0));

$db     = Database::sqlite();
$result = HistoryManager::list($db, $limit, $offset);
echo json_encode($result);
