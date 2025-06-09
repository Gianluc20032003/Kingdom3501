<?php
// admin/kvk-etapas.php
// Gestionar etapas de KvK (solo admin)

require_once '../config/config.php';

// Verificar que es admin
$user = requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();
    
    switch ($method) {
        case 'GET':
            // Obtener todas las etapas
            $stmt = $pdo->query("
                SELECT 
                    id, 
                    nombre_etapa, 
                    orden_etapa, 
                    activa,
                    fecha_creacion,
                    (SELECT COUNT(*) FROM kvk_batallas WHERE etapa_id = kvk_etapas.id) as participantes
                FROM kvk_etapas 
                ORDER BY orden_etapa ASC
            ");
            $etapas = $stmt->fetchAll();
            
            sendResponse(true, 'Etapas obtenidas exitosamente', $etapas);
            break;
            
        case 'POST':
            // Crear nueva etapa
            $input = json_decode(file_get_contents('php://input'), true);
            
            $rules = [
                'nombre_etapa' => ['required' => true, 'type' => 'string', 'max_length' => 100],
                'orden_etapa' => ['required' => true, 'type' => 'int', 'min' => 1]
            ];
            
            $errors = validateInput($input, $rules);
            if (!empty($errors)) {
                sendResponse(false, 'Datos inválidos', $errors, 400);
            }
            
            // Verificar que no exista otra etapa con el mismo orden
            $stmt = $pdo->prepare("
                SELECT id FROM kvk_etapas WHERE orden_etapa = ?
            ");
            $stmt->execute([$input['orden_etapa']]);
            if ($stmt->fetch()) {
                sendResponse(false, 'Ya existe una etapa con ese orden', null, 400);
            }
            
            // Crear etapa
            $stmt = $pdo->prepare("
                INSERT INTO kvk_etapas (nombre_etapa, orden_etapa)
                VALUES (?, ?)
            ");
            $stmt->execute([$input['nombre_etapa'], $input['orden_etapa']]);
            
            sendResponse(true, 'Etapa creada exitosamente');
            break;
            
        case 'PUT':
            // Actualizar etapa existente
            $input = json_decode(file_get_contents('php://input'), true);
            
            $rules = [
                'id' => ['required' => true, 'type' => 'int'],
                'nombre_etapa' => ['required' => true, 'type' => 'string', 'max_length' => 100],
                'orden_etapa' => ['required' => true, 'type' => 'int', 'min' => 1],
                'activa' => ['required' => true, 'type' => 'int', 'min' => 0, 'max' => 1]
            ];
            
            $errors = validateInput($input, $rules);
            if (!empty($errors)) {
                sendResponse(false, 'Datos inválidos', $errors, 400);
            }
            
            // Verificar que la etapa existe
            $stmt = $pdo->prepare("SELECT id FROM kvk_etapas WHERE id = ?");
            $stmt->execute([$input['id']]);
            if (!$stmt->fetch()) {
                sendResponse(false, 'La etapa no existe', null, 404);
            }
            
            // Verificar que no exista otra etapa con el mismo orden (excepto la actual)
            $stmt = $pdo->prepare("
                SELECT id FROM kvk_etapas WHERE orden_etapa = ? AND id != ?
            ");
            $stmt->execute([$input['orden_etapa'], $input['id']]);
            if ($stmt->fetch()) {
                sendResponse(false, 'Ya existe otra etapa con ese orden', null, 400);
            }
            
            // Actualizar etapa
            $stmt = $pdo->prepare("
                UPDATE kvk_etapas 
                SET nombre_etapa = ?, orden_etapa = ?, activa = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $input['nombre_etapa'], 
                $input['orden_etapa'], 
                $input['activa'],
                $input['id']
            ]);
            
            sendResponse(true, 'Etapa actualizada exitosamente');
            break;
            
        case 'DELETE':
            // Eliminar etapa
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id']) || !is_numeric($input['id'])) {
                sendResponse(false, 'ID de etapa requerido', null, 400);
            }
            
            // Verificar si tiene batallas asociadas
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as count FROM kvk_batallas WHERE etapa_id = ?
            ");
            $stmt->execute([$input['id']]);
            $result = $stmt->fetch();
            
            if ($result['count'] > 0) {
                sendResponse(false, 'No se puede eliminar una etapa que tiene batallas registradas', null, 400);
            }
            
            // Eliminar etapa
            $stmt = $pdo->prepare("DELETE FROM kvk_etapas WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            if ($stmt->rowCount() > 0) {
                sendResponse(true, 'Etapa eliminada exitosamente');
            } else {
                sendResponse(false, 'La etapa no existe', null, 404);
            }
            break;
            
        default:
            sendResponse(false, 'Método no permitido', null, 405);
    }
    
} catch (PDOException $e) {
    error_log('Error en gestión de etapas KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error en gestión de etapas KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>