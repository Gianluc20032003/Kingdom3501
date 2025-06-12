<?php
// movilizacion/save.php
// Guardar datos de movilización de alianza - ACTUALIZADO

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// NUEVO: Verificar si el evento está activo
try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT activo FROM movilizacion_config ORDER BY fecha_creacion DESC LIMIT 1");
    $stmt->execute();
    $config = $stmt->fetch();
    
    if ($config && !$config['activo']) {
        sendResponse(false, 'El evento de movilización está actualmente desactivado', null, 403);
    }
    
} catch (Exception $e) {
    // Si no hay configuración, permitir el registro (evento activo por defecto)
}

// Validar entrada
$puntos = $_POST['puntos'] ?? null;

if (empty($puntos) || !is_numeric($puntos) || $puntos < 0) {
    sendResponse(false, 'Los puntos deben ser un número válido mayor o igual a 0', null, 400);
}

$puntos = (int) $puntos;

try {
    // Verificar si ya existe un registro para este usuario
    $stmt = $pdo->prepare("
        SELECT id, foto_url 
        FROM movilizacion_alianza 
        WHERE usuario_id = ?
    ");
    $stmt->execute([$user->user_id]);
    $existingRecord = $stmt->fetch();
    
    $fotoUrl = null;
    
    // Procesar imagen si se subió una nueva
    if (isset($_FILES['foto_puntos']) && $_FILES['foto_puntos']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoUrl = uploadFile($_FILES['foto_puntos'], 'movilizacion');
            
            // Si es una actualización y había una foto anterior, eliminarla
            if ($existingRecord && $existingRecord['foto_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        // Si es una actualización sin nueva foto, mantener la foto existente
        $fotoUrl = $existingRecord['foto_url'];
    } else {
        // Si es un nuevo registro y no se subió foto
        sendResponse(false, 'La foto es requerida para el registro inicial', null, 400);
    }
    
    if ($existingRecord) {
        // Actualizar registro existente (cumple_minimo se actualiza automáticamente por trigger)
        $stmt = $pdo->prepare("
            UPDATE movilizacion_alianza 
            SET puntos = ?, foto_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$puntos, $fotoUrl, $existingRecord['id']]);
        
        sendResponse(true, 'Datos actualizados exitosamente');
    } else {
        // Crear nuevo registro (cumple_minimo se establece automáticamente por trigger)
        $stmt = $pdo->prepare("
            INSERT INTO movilizacion_alianza (usuario_id, puntos, foto_url)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user->user_id, $puntos, $fotoUrl]);
        
        sendResponse(true, 'Datos registrados exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando datos de movilización: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando datos de movilización: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>