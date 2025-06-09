<?php
// kvk/save-initial.php
// Guardar Kill Points iniciales de KvK

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$killPointsIniciales = $_POST['kill_points_iniciales'] ?? null;

if (empty($killPointsIniciales) || !is_numeric($killPointsIniciales) || $killPointsIniciales < 0) {
    sendResponse(false, 'Los Kill Points iniciales deben ser un número válido mayor o igual a 0', null, 400);
}

$killPointsIniciales = (int) $killPointsIniciales;

try {
    $pdo = getDBConnection();
    
    // Verificar si ya existe un registro inicial
    $stmt = $pdo->prepare("
        SELECT id, foto_inicial_url 
        FROM kvk_datos 
        WHERE usuario_id = ?
        ORDER BY fecha_registro DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id]);
    $existingRecord = $stmt->fetch();
    
    $fotoUrl = null;
    
    // Procesar imagen si se subió una nueva
    if (isset($_FILES['foto_inicial']) && $_FILES['foto_inicial']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoUrl = uploadFile($_FILES['foto_inicial'], 'kvk');
            
            // Si es una actualización y había una foto anterior, eliminarla
            if ($existingRecord && $existingRecord['foto_inicial_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_inicial_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        // Si es una actualización sin nueva foto, mantener la foto existente
        $fotoUrl = $existingRecord['foto_inicial_url'];
    } else {
        // Si es un nuevo registro y no se subió foto
        sendResponse(false, 'La foto es requerida para el registro inicial', null, 400);
    }
    
    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE kvk_datos 
            SET kill_points_iniciales = ?, foto_inicial_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$killPointsIniciales, $fotoUrl, $existingRecord['id']]);
        
        sendResponse(true, 'Kill Points iniciales actualizados exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO kvk_datos (usuario_id, kill_points_iniciales, foto_inicial_url)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user->user_id, $killPointsIniciales, $fotoUrl]);
        
        sendResponse(true, 'Kill Points iniciales registrados exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando datos iniciales de KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando datos iniciales de KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>