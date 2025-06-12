<?php
// api/movilizacion/settings.php
// Obtener configuración del evento para usuarios normales (solo lectura)

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

// Los usuarios normales solo necesitan autenticación básica
$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener configuración del evento
    $stmt = $pdo->prepare("
        SELECT activo
        FROM movilizacion_config 
        ORDER BY fecha_creacion DESC
        LIMIT 1
    ");
    $stmt->execute();
    $config = $stmt->fetch();
    
    if (!$config) {
        // Si no hay configuración, asumir que el evento está activo
        $config = ['activo' => true];
    } else {
        $config['activo'] = (bool) $config['activo'];
    }
    
    sendResponse(true, 'Configuración obtenida exitosamente', $config);
    
} catch (Exception $e) {
    error_log('Error obteniendo configuración de movilización para usuario: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>