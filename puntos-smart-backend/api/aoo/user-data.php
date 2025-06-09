<?php
// aoo/user-data.php
// Obtener datos del usuario para AOO

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener configuración activa
    $stmt = $pdo->prepare("
        SELECT id FROM aoo_config 
        WHERE activo = 1
        ORDER BY fecha_creacion DESC
        LIMIT 1
    ");
    $stmt->execute();
    $activeConfig = $stmt->fetch();
    
    if (!$activeConfig) {
        sendResponse(true, 'No hay configuración AOO activa', ['inscripcion' => null]);
    }
    
    // Obtener inscripción del usuario para la configuración activa
    $stmt = $pdo->prepare("
        SELECT 
            ai.foto_comandantes_url,
            ai.cantidad_tropas,
            ai.puede_liderar_rally,
            ai.puede_liderar_guarnicion,
            ai.comandantes_disponibles,
            ai.fecha_inscripcion,
            ac.horario
        FROM aoo_inscripciones ai
        INNER JOIN aoo_config ac ON ai.aoo_config_id = ac.id
        WHERE ai.usuario_id = ? AND ai.aoo_config_id = ?
        ORDER BY ai.fecha_inscripcion DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id, $activeConfig['id']]);
    $userData = $stmt->fetch();
    
    sendResponse(true, 'Datos obtenidos exitosamente', [
        'inscripcion' => $userData,
        'config_id' => $activeConfig['id']
    ]);
    
} catch (Exception $e) {
    error_log('Error obteniendo datos AOO del usuario: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>