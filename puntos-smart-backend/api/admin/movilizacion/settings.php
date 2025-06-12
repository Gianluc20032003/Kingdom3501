<?php
// api/admin/movilizacion/settings.php
// Gestionar configuraciones del evento de movilización

// Headers CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/config.php';

$user = getAuthenticatedUser();

// Solo admins pueden gestionar configuraciones
if (!$user->es_admin) {
    sendResponse(false, 'Acceso denegado. Se requieren permisos de administrador.', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener configuración actual
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            SELECT activo
            FROM movilizacion_config 
            ORDER BY fecha_creacion DESC
            LIMIT 1
        ");
        $stmt->execute();
        $config = $stmt->fetch();
        
        if (!$config) {
            // Si no existe configuración, crear una por defecto
            $stmt = $pdo->prepare("
                INSERT INTO movilizacion_config (activo, admin_id) 
                VALUES (0, ?)
            ");
            $stmt->execute([$user->user_id]);
            
            $config = [
                'activo' => false
            ];
        } else {
            $config['activo'] = (bool) $config['activo'];
        }
        
        sendResponse(true, 'Configuración obtenida exitosamente', $config);
        
    } catch (Exception $e) {
        error_log('Error obteniendo configuración de movilización: ' . $e->getMessage());
        sendResponse(false, 'Error interno del servidor', null, 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Actualizar configuración
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['activo'])) {
            sendResponse(false, 'Estado requerido', null, 400);
        }
        
        $activo = $input['activo'] ? 1 : 0;
        
        $pdo = getDBConnection();
        
        // Verificar si existe configuración
        $stmt = $pdo->prepare("SELECT id FROM movilizacion_config ORDER BY fecha_creacion DESC LIMIT 1");
        $stmt->execute();
        $existingConfig = $stmt->fetch();
        
        if ($existingConfig) {
            // Actualizar configuración existente
            $stmt = $pdo->prepare("
                UPDATE movilizacion_config 
                SET activo = ?, admin_id = ?, fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([$activo, $user->user_id, $existingConfig['id']]);
        } else {
            // Crear nueva configuración
            $stmt = $pdo->prepare("
                INSERT INTO movilizacion_config (activo, admin_id) 
                VALUES (?, ?)
            ");
            $stmt->execute([$activo, $user->user_id]);
        }
        
        sendResponse(true, 'Configuración actualizada exitosamente');
        
    } catch (Exception $e) {
        error_log('Error actualizando configuración de movilización: ' . $e->getMessage());
        sendResponse(false, 'Error interno del servidor', null, 500);
    }
    
} else {
    sendResponse(false, 'Método no permitido', null, 405);
}
?>