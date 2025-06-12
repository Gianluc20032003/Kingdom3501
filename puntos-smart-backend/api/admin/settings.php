<?php
// kvk/settings.php
// Gestionar configuraciones de bloqueo/desbloqueo de módulos KvK

require_once '../config/config.php';

$user = getAuthenticatedUser();

// Solo admins pueden gestionar configuraciones
if (!$user->es_admin) {
    sendResponse(false, 'Acceso denegado. Se requieren permisos de administrador.', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener configuraciones actuales
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            SELECT nombre_configuracion, valor, descripcion, fecha_actualizacion
            FROM kvk_configuraciones 
            WHERE activa = 1
        ");
        $stmt->execute();
        $configuraciones = $stmt->fetchAll();
        
        // Crear array asociativo para fácil acceso
        $config = [];
        foreach ($configuraciones as $conf) {
            $config[$conf['nombre_configuracion']] = [
                'valor' => $conf['valor'],
                'descripcion' => $conf['descripcion'],
                'fecha_actualizacion' => $conf['fecha_actualizacion']
            ];
        }
        
        sendResponse(true, 'Configuraciones obtenidas exitosamente', [
            'configuraciones' => $config
        ]);
        
    } catch (Exception $e) {
        error_log('Error obteniendo configuraciones KvK: ' . $e->getMessage());
        sendResponse(false, 'Error interno del servidor', null, 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Actualizar configuraciones
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['configuraciones']) || !is_array($input['configuraciones'])) {
            sendResponse(false, 'Formato de datos inválido', null, 400);
        }
        
        $pdo = getDBConnection();
        $pdo->beginTransaction();
        
        // Preparar statement para insertar/actualizar configuraciones
        $stmt = $pdo->prepare("
            INSERT INTO kvk_configuraciones (nombre_configuracion, valor, descripcion, admin_id, activa) 
            VALUES (?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE 
                valor = VALUES(valor),
                admin_id = VALUES(admin_id),
                fecha_actualizacion = CURRENT_TIMESTAMP
        ");
        
        $configuracionesPermitidas = [
            'honor_bloqueado' => 'Bloquear/desbloquear registro de Honor',
            'batallas_bloqueado' => 'Bloquear/desbloquear registro de Batallas',
            'initial_data_bloqueado' => 'Bloquear/desbloquear registro de Datos Iniciales',
            'mensaje_honor' => 'Mensaje personalizado para Honor bloqueado',
            'mensaje_batallas' => 'Mensaje personalizado para Batallas bloqueadas',
            'mensaje_initial_data' => 'Mensaje personalizado para Datos Iniciales bloqueados'
        ];
        
        foreach ($input['configuraciones'] as $nombre => $valor) {
            if (!array_key_exists($nombre, $configuracionesPermitidas)) {
                continue; // Saltar configuraciones no permitidas
            }
            
            $descripcion = $configuracionesPermitidas[$nombre];
            
            // Validar valores booleanos para configuraciones de bloqueo
            if (strpos($nombre, '_bloqueado') !== false) {
                $valor = $valor ? '1' : '0';
            }
            
            $stmt->execute([$nombre, $valor, $descripcion, $user->user_id]);
        }
        
        $pdo->commit();
        
        sendResponse(true, 'Configuraciones actualizadas exitosamente');
        
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('Error actualizando configuraciones KvK: ' . $e->getMessage());
        sendResponse(false, 'Error interno del servidor', null, 500);
    }
    
} else {
    sendResponse(false, 'Método no permitido', null, 405);
}
?>