<?php
// api/kvk/prekvk-data.php
// Obtener datos de Pre-KvK del usuario

// Headers CORS - AGREGADO
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request - AGREGADO
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
    
    // Obtener datos de Pre-KvK del usuario actual
    $stmt = $pdo->prepare("
        SELECT 
            puntos_kvk,
            foto_puntos_kvk_url,
            fecha_registro,
            fecha_actualizacion
        FROM kvk_pre_kvk 
        WHERE usuario_id = ?
        ORDER BY fecha_registro DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id]);
    $preKvkData = $stmt->fetch();
    
    sendResponse(true, 'Datos de Pre-KvK obtenidos exitosamente', $preKvkData);
    
} catch (Exception $e) {
    error_log('Error obteniendo datos Pre-KvK del usuario: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>