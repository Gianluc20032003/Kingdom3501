<?php
// mge/postulaciones.php
// Obtener todas las postulaciones MGE (solo admin)

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = requireAdmin(); // Solo admins pueden ver postulaciones

try {
    $pdo = getDBConnection();
    
    // Obtener todas las postulaciones del evento activo
    $stmt = $pdo->prepare("
        SELECT 
            u.nombre_usuario,
            mp.foto_equipamiento_url,
            mp.foto_inscripciones_url,
            mp.foto_comandantes_url,
            mp.foto_cabezas_url,
            mp.comandante_principal,
            mp.comandante_pareja,
            mp.fecha_postulacion,
            mc.tipo_tropa
        FROM mge_postulaciones mp
        INNER JOIN usuarios u ON mp.usuario_id = u.id
        INNER JOIN mge_config mc ON mp.mge_config_id = mc.id
        WHERE mc.activo = 1
        ORDER BY mp.fecha_postulacion DESC
    ");
    $stmt->execute();
    $postulaciones = $stmt->fetchAll();
    
    // Mapear tipos de tropa
    $tiposTropa = [
        'arqueria' => 'Arquería',
        'infanteria' => 'Infantería',
        'caballeria' => 'Caballería', 
        'liderazgo' => 'Liderazgo',
        'ingenieros' => 'Ingenieros'
    ];
    
    // Agregar display names
    foreach ($postulaciones as &$postulacion) {
        $postulacion['tipo_tropa_display'] = $tiposTropa[$postulacion['tipo_tropa']] ?? $postulacion['tipo_tropa'];
    }
    
    sendResponse(true, 'Postulaciones MGE obtenidas', $postulaciones);
    
} catch (Exception $e) {
    error_log('Error obteniendo postulaciones MGE: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>