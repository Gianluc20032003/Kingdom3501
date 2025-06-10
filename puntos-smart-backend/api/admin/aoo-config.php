<?php
// admin/aoo-config.php
// Gestionar configuración de eventos AOO (solo admin)

require_once '../config/config.php';

// Solo admins pueden acceder
$user = requireAdmin();

try {
    $pdo = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Obtener todos los eventos AOO (activos e inactivos)
        $stmt = $pdo->query("
            SELECT 
                ac.id,
                ac.horario,
                ac.activo,
                ac.fecha_creacion,
                COUNT(ai.id) as total_inscritos
            FROM aoo_config ac
            LEFT JOIN aoo_inscripciones ai ON ac.id = ai.aoo_config_id
            GROUP BY ac.id, ac.horario, ac.activo, ac.fecha_creacion
            ORDER BY ac.fecha_creacion DESC
        ");
        $eventos = $stmt->fetchAll();
        
        sendResponse(true, 'Eventos AOO obtenidos', ['eventos' => $eventos]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? null;
        
        switch ($action) {
            case 'create':
                // Crear nuevo evento AOO
                $horario = trim($input['horario'] ?? '');
                
                if (empty($horario)) {
                    sendResponse(false, 'El horario es requerido', null, 400);
                }
                
                // Desactivar todos los eventos anteriores
                $stmt = $pdo->prepare("UPDATE aoo_config SET activo = 0");
                $stmt->execute();
                
                // Crear nuevo evento activo
                $stmt = $pdo->prepare("
                    INSERT INTO aoo_config (horario, activo) 
                    VALUES (?, 1)
                ");
                $stmt->execute([$horario]);
                
                sendResponse(true, 'Evento AOO creado exitosamente');
                break;
                
            case 'toggle':
                // Activar/desactivar evento
                $eventId = $input['event_id'] ?? null;
                $activo = $input['activo'] ?? 0;
                
                if (empty($eventId)) {
                    sendResponse(false, 'ID de evento requerido', null, 400);
                }
                
                if ($activo) {
                    // Si se activa este evento, desactivar todos los demás
                    $stmt = $pdo->prepare("UPDATE aoo_config SET activo = 0");
                    $stmt->execute();
                }
                
                // Actualizar el evento específico
                $stmt = $pdo->prepare("
                    UPDATE aoo_config 
                    SET activo = ? 
                    WHERE id = ?
                ");
                $stmt->execute([$activo ? 1 : 0, $eventId]);
                
                $mensaje = $activo ? 'Evento activado' : 'Evento desactivado';
                sendResponse(true, $mensaje);
                break;
                
            case 'delete':
                // Eliminar evento (CASCADE eliminará las inscripciones automáticamente)
                $eventId = $input['event_id'] ?? null;
                
                if (empty($eventId)) {
                    sendResponse(false, 'ID de evento requerido', null, 400);
                }
                
                // Obtener información del evento antes de eliminar
                $stmt = $pdo->prepare("
                    SELECT 
                        ac.horario,
                        COUNT(ai.id) as total_inscritos
                    FROM aoo_config ac
                    LEFT JOIN aoo_inscripciones ai ON ac.id = ai.aoo_config_id
                    WHERE ac.id = ?
                    GROUP BY ac.id, ac.horario
                ");
                $stmt->execute([$eventId]);
                $eventoInfo = $stmt->fetch();
                
                if (!$eventoInfo) {
                    sendResponse(false, 'Evento no encontrado', null, 404);
                }
                
                // Si hay inscripciones, eliminar las fotos manualmente antes del CASCADE
                if ($eventoInfo['total_inscritos'] > 0) {
                    $stmt = $pdo->prepare("
                        SELECT foto_comandantes_url 
                        FROM aoo_inscripciones 
                        WHERE aoo_config_id = ? AND foto_comandantes_url IS NOT NULL
                    ");
                    $stmt->execute([$eventId]);
                    $fotos = $stmt->fetchAll();
                    
                    // Eliminar archivos de fotos del servidor
                    foreach ($fotos as $foto) {
                        $filePath = UPLOAD_DIR . $foto['foto_comandantes_url'];
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                    }
                }
                
                // Eliminar el evento (CASCADE eliminará las inscripciones automáticamente)
                $stmt = $pdo->prepare("DELETE FROM aoo_config WHERE id = ?");
                $stmt->execute([$eventId]);
                
                $mensaje = $eventoInfo['total_inscritos'] > 0 
                    ? "Evento '{$eventoInfo['horario']}' eliminado junto con {$eventoInfo['total_inscritos']} inscripciones"
                    : "Evento '{$eventoInfo['horario']}' eliminado exitosamente";
                    
                sendResponse(true, $mensaje);
                break;
                
            default:
                sendResponse(false, 'Acción no válida', null, 400);
        }
        
    } else {
        sendResponse(false, 'Método no permitido', null, 405);
    }
    
} catch (Exception $e) {
    error_log('Error en admin AOO: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>