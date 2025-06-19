<?php
// api/kvk/prekvk-ranking.php
// Obtener ranking de Pre-KvK de todos los usuarios

// Headers CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener datos de Pre-KvK de todos los usuarios, unidos con la tabla de usuarios
    $stmt = $pdo->prepare("
        SELECT 
            kpk.usuario_id,
            u.nombre_usuario AS username,
            kpk.puntos_kvk,
            kpk.foto_puntos_kvk_url
        FROM kvk_pre_kvk kpk
        INNER JOIN usuarios u ON kpk.usuario_id = u.id
        ORDER BY kpk.puntos_kvk DESC;
    ");
    $stmt->execute();
    $rankingData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Ranking de Pre-KvK obtenido exitosamente', $rankingData);
    
} catch (Exception $e) {
    error_log('Error obteniendo ranking Pre-KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>