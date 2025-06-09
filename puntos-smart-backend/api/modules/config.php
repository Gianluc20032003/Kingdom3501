<?php
// modules/config.php
// Endpoint para obtener configuración de módulos

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

// Validar autenticación (el debug ya está en getAuthenticatedUser)
$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener configuración de todos los módulos
    $stmt = $pdo->query("
        SELECT modulo_nombre, habilitado, configuracion 
        FROM modulos_config 
        ORDER BY modulo_nombre
    ");
    $modules = $stmt->fetchAll();
    
    $moduleConfig = [];
    foreach ($modules as $module) {
        $moduleConfig[$module['modulo_nombre']] = [
            'habilitado' => (bool) $module['habilitado'],
            'configuracion' => json_decode($module['configuracion'], true)
        ];
    }
    
    sendResponse(true, 'Configuración obtenida exitosamente', ['modules' => $moduleConfig]);
    
} catch (Exception $e) {
    error_log('Error obteniendo configuración de módulos: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>