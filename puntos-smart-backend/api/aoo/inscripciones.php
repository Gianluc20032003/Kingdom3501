<?php
// aoo/inscripciones.php
// Obtener todas las inscripciones AOO (para admin)

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Solo admins pueden ver todas las inscripciones
if (!$user->es_admin) {
    sendResponse(false, 'Acceso denegado. Se requieren permisos de administrador.', null, 403);
}

try {
    $pdo = getDBConnection();
    
    // Obtener configuración activa
    $stmt = $pdo->prepare("
        SELECT id, horario 
        FROM aoo_config 
        WHERE activo = 1
        ORDER BY fecha_creacion DESC
        LIMIT 1
    ");
    $stmt->execute();
    $activeConfig = $stmt->fetch();
    
    if (!$activeConfig) {
        sendResponse(true, 'No hay configuración AOO activa', [
            'inscripciones' => [],
            'config' => null
        ]);
    }
    
    // Obtener todas las inscripciones para la configuración activa
    $stmt = $pdo->prepare("
        SELECT 
            u.nombre_usuario,
            ai.foto_comandantes_url,
            ai.cantidad_tropas,
            ai.puede_liderar_rally,
            ai.puede_liderar_guarnicion,
            ai.comandantes_disponibles,
            ai.fecha_inscripcion
        FROM aoo_inscripciones ai
        INNER JOIN usuarios u ON ai.usuario_id = u.id
        WHERE ai.aoo_config_id = ?
        ORDER BY ai.fecha_inscripcion ASC
    ");
    $stmt->execute([$activeConfig['id']]);
    $inscripciones = $stmt->fetchAll();
    
    sendResponse(true, 'Inscripciones obtenidas exitosamente', [
        'inscripciones' => $inscripciones,
        'config' => $activeConfig,
        'total_inscritos' => count($inscripciones)
    ]);
    
} catch (Exception $e) {
    error_log('Error obteniendo inscripciones AOO: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>