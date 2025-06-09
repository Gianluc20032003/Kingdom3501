<?php
// fortalezas/save.php
// Guardar datos de fortalezas bárbaras

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$cantidadCofres = $_POST['cantidad_cofres'] ?? null;

if (empty($cantidadCofres) || !is_numeric($cantidadCofres) || $cantidadCofres < 0) {
    sendResponse(false, 'La cantidad de cofres debe ser un número válido mayor o igual a 0', null, 400);
}

$cantidadCofres = (int) $cantidadCofres;

try {
    $pdo = getDBConnection();
    
    $currentWeek = getCurrentWeek();
    $currentYear = getCurrentYear();
    
    // Verificar si ya existe un registro para esta semana
    $stmt = $pdo->prepare("
        SELECT id, foto_url 
        FROM fortalezas_barbaras 
        WHERE usuario_id = ? AND semana = ? AND ano = ?
    ");
    $stmt->execute([$user->user_id, $currentWeek, $currentYear]);
    $existingRecord = $stmt->fetch();
    
    $fotoUrl = null;
    
    // Procesar imagen si se subió una nueva
    if (isset($_FILES['foto_cofres']) && $_FILES['foto_cofres']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoUrl = uploadFile($_FILES['foto_cofres'], 'fortalezas');
            
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
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE fortalezas_barbaras 
            SET cantidad_cofres = ?, foto_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$cantidadCofres, $fotoUrl, $existingRecord['id']]);
        
        sendResponse(true, 'Datos actualizados exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO fortalezas_barbaras (usuario_id, cantidad_cofres, foto_url, semana, ano)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user->user_id, $cantidadCofres, $fotoUrl, $currentWeek, $currentYear]);
        
        sendResponse(true, 'Datos registrados exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando datos de fortalezas: ' . $e->getMessage());
    
    if ($e->getCode() == 23000) { // Violación de restricción única
        sendResponse(false, 'Ya existe un registro para esta semana', null, 409);
    } else {
        sendResponse(false, 'Error interno del servidor', null, 500);
    }
} catch (Exception $e) {
    error_log('Error guardando datos de fortalezas: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>