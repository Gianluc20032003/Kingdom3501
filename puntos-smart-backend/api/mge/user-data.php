<?php

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener configuración activa
    $stmt = $pdo->prepare("
        SELECT id FROM mge_config 
        WHERE activo = 1 
        ORDER BY fecha_creacion DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $config = $stmt->fetch();
    
    if (!$config) {
        sendResponse(true, 'No hay eventos MGE activos', null);
    }
    
    // Obtener postulación del usuario para el evento activo
    $stmt = $pdo->prepare("
        SELECT 
            mp.foto_equipamiento_url,
            mp.foto_inscripciones_url,
            mp.foto_comandantes_url,
            mp.foto_cabezas_url,
            mp.comandante_principal,
            mp.comandante_pareja,
            mp.fecha_postulacion,
            mc.tipo_tropa
        FROM mge_postulaciones mp
        INNER JOIN mge_config mc ON mp.mge_config_id = mc.id
        WHERE mp.usuario_id = ? AND mp.mge_config_id = ?
        ORDER BY mp.fecha_postulacion DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id, $config['id']]);
    $userData = $stmt->fetch();
    
    sendResponse(true, 'Datos MGE obtenidos', $userData);
    
} catch (Exception $e) {
    error_log('Error obteniendo datos MGE: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>