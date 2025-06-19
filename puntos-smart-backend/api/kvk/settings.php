<?php
// api/kvk/settings.php - CON PRE-KVK
// Obtener configuraciones de KvK para usuarios normales (solo lectura)

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
    
    // Obtener solo las configuraciones necesarias para usuarios normales (INCLUYENDO PRE-KVK)
    $stmt = $pdo->prepare("
        SELECT nombre_configuracion, valor 
        FROM kvk_configuraciones 
        WHERE activa = 1 
        AND nombre_configuracion IN (
            'prekvk_bloqueado',
            'honor_bloqueado', 
            'batallas_bloqueado', 
            'initial_data_bloqueado',
            'mensaje_prekvk',
            'mensaje_honor',
            'mensaje_batallas',
            'mensaje_initial_data'
        )
    ");
    $stmt->execute();
    $configuraciones = $stmt->fetchAll();
    
    // Crear array asociativo para fácil acceso
    $config = [];
    foreach ($configuraciones as $conf) {
        $config[$conf['nombre_configuracion']] = [
            'valor' => $conf['valor']
        ];
    }
    
    sendResponse(true, 'Configuraciones obtenidas exitosamente', [
        'configuraciones' => $config
    ]);
    
} catch (Exception $e) {
    error_log('Error obteniendo configuraciones KvK para usuario: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>