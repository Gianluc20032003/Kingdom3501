<?php
// movilizacion/user-data.php
// Obtener datos del usuario para movilización de alianza

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener datos del usuario actual
    $stmt = $pdo->prepare("
        SELECT puntos, foto_url, cumple_minimo, fecha_registro
        FROM movilizacion_alianza 
        WHERE usuario_id = ?
        ORDER BY fecha_registro DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id]);
    $userData = $stmt->fetch();
    
    sendResponse(true, 'Datos obtenidos exitosamente', $userData);
    
} catch (Exception $e) {
    error_log('Error obteniendo datos de movilización: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>