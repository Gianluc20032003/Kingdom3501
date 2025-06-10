<?php
// kvk/save-honor.php
// Guardar datos de Honor

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$honorCantidad = $_POST['honor_cantidad'] ?? null;

if (empty($honorCantidad) || !is_numeric($honorCantidad) || $honorCantidad < 0) {
    sendResponse(false, 'El Honor debe ser un número válido mayor o igual a 0', null, 400);
}

$honorCantidad = (int) $honorCantidad;

try {
    $pdo = getDBConnection();
    
    // Verificar si ya existe un registro de honor para este usuario
    $stmt = $pdo->prepare("
        SELECT id, foto_honor_url 
        FROM kvk_honor 
        WHERE usuario_id = ?
    ");
    $stmt->execute([$user->user_id]);
    $existingRecord = $stmt->fetch();
    
    $fotoHonorUrl = null;
    
    // Procesar imagen de honor
    if (isset($_FILES['foto_honor']) && $_FILES['foto_honor']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoHonorUrl = uploadFile($_FILES['foto_honor'], 'kvk');
            
            // Si es una actualización y había una foto anterior, eliminarla
            if ($existingRecord && $existingRecord['foto_honor_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_honor_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen de honor: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        $fotoHonorUrl = $existingRecord['foto_honor_url'];
    } else {
        sendResponse(false, 'La foto de honor es requerida para el registro inicial', null, 400);
    }
    
    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE kvk_honor 
            SET honor_cantidad = ?, foto_honor_url = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->execute([$honorCantidad, $fotoHonorUrl, $existingRecord['id']]);
        
        sendResponse(true, 'Honor actualizado exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO kvk_honor (usuario_id, honor_cantidad, foto_honor_url)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user->user_id, $honorCantidad, $fotoHonorUrl]);
        
        sendResponse(true, 'Honor registrado exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando Honor: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando Honor: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>