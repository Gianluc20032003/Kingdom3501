<?php

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener configuración activa de MGE
    $stmt = $pdo->prepare("
        SELECT id, tipo_tropa, fecha_creacion
        FROM mge_config 
        WHERE activo = 1 
        ORDER BY fecha_creacion DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $config = $stmt->fetch();
    
    if (!$config) {
        sendResponse(false, 'No hay eventos MGE activos', null, 404);
    }
    
    // Mapear tipos de tropa a nombres amigables
    $tiposTropa = [
        'arqueria' => 'Arquería',
        'infanteria' => 'Infantería', 
        'caballeria' => 'Caballería',
        'liderazgo' => 'Liderazgo',
        'ingenieros' => 'Ingenieros'
    ];
    
    $response = [
        'config_id' => $config['id'],
        'tipo_tropa' => $config['tipo_tropa'],
        'tipo_tropa_display' => $tiposTropa[$config['tipo_tropa']] ?? $config['tipo_tropa'],
        'fecha_creacion' => $config['fecha_creacion']
    ];
    
    sendResponse(true, 'Configuración MGE obtenida', $response);
    
} catch (Exception $e) {
    error_log('Error obteniendo config MGE: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>