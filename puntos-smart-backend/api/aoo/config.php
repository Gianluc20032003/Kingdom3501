<?php
// aoo/config.php
// Obtener configuración actual de AOO

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener configuración activa de AOO
    $stmt = $pdo->prepare("
        SELECT id, horario, activo, fecha_creacion
        FROM aoo_config 
        WHERE activo = 1
        ORDER BY fecha_creacion DESC
        LIMIT 1
    ");
    $stmt->execute();
    $config = $stmt->fetch();
    
    if (!$config) {
        sendResponse(true, 'No hay configuración AOO activa', [
            'config' => null,
            'mensaje' => 'El administrador debe configurar un evento AOO'
        ]);
    }
    
    sendResponse(true, 'Configuración AOO obtenida', [
        'config' => $config
    ]);
    
} catch (Exception $e) {
    error_log('Error obteniendo configuración AOO: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>