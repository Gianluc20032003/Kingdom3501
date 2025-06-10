<?php
// kvk/save-initial.php
// Guardar Kill Points iniciales antes del KvK

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$killPointsIniciales = $_POST['kill_points_iniciales'] ?? null;
$muertesPropiasIniciales = $_POST['muertes_propias_iniciales'] ?? null;

if (empty($killPointsIniciales) || !is_numeric($killPointsIniciales) || $killPointsIniciales < 0) {
    sendResponse(false, 'Los Kill Points iniciales deben ser un número válido mayor o igual a 0', null, 400);
}
if (empty($muertesPropiasIniciales) || !is_numeric($muertesPropiasIniciales) || $muertesPropiasIniciales < 0) {
    sendResponse(false, 'Las muertes propias iniciales deben ser un número válido mayor o igual a 0', null, 400);
}

$killPointsIniciales = (int) $killPointsIniciales;
$muertesPropiasIniciales = (int) $muertesPropiasIniciales;

try {
    $pdo = getDBConnection();
    
    // Verificar si ya existe un registro para este usuario
    $stmt = $pdo->prepare("
        SELECT id, foto_inicial_url, foto_muertes_iniciales_url 
        FROM kvk_datos 
        WHERE usuario_id = ?
    ");
    $stmt->execute([$user->user_id]);
    $existingRecord = $stmt->fetch();
    
    $fotoInicialUrl = null;
    $fotoMuertesInicialesUrl = null;
    
    // Procesar imagen de kill points
    if (isset($_FILES['foto_inicial']) && $_FILES['foto_inicial']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoInicialUrl = uploadFile($_FILES['foto_inicial'], 'kvk');
            
            // Si es una actualización y había una foto anterior, eliminarla
            if ($existingRecord && $existingRecord['foto_inicial_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_inicial_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen de kill points: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        $fotoInicialUrl = $existingRecord['foto_inicial_url'];
    } else {
        sendResponse(false, 'La foto de kill points es requerida para el registro inicial', null, 400);
    }
    
    // Procesar imagen de muertes iniciales
    if (isset($_FILES['foto_muertes_iniciales']) && $_FILES['foto_muertes_iniciales']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoMuertesInicialesUrl = uploadFile($_FILES['foto_muertes_iniciales'], 'kvk');
            
            // Si es una actualización y había una foto anterior, eliminarla
            if ($existingRecord && $existingRecord['foto_muertes_iniciales_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_muertes_iniciales_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen de muertes iniciales: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        $fotoMuertesInicialesUrl = $existingRecord['foto_muertes_iniciales_url'];
    } else {
        sendResponse(false, 'La foto de muertes iniciales es requerida para el registro inicial', null, 400);
    }
    
    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE kvk_datos 
            SET kill_points_iniciales = ?, muertes_propias_iniciales = ?, 
                foto_inicial_url = ?, foto_muertes_iniciales_url = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $killPointsIniciales, $muertesPropiasIniciales, 
            $fotoInicialUrl, $fotoMuertesInicialesUrl, $existingRecord['id']
        ]);
        
        sendResponse(true, 'Kill Points iniciales actualizados exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO kvk_datos (
                usuario_id, kill_points_iniciales, muertes_propias_iniciales, 
                foto_inicial_url, foto_muertes_iniciales_url
            )
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user->user_id, $killPointsIniciales, $muertesPropiasIniciales, 
            $fotoInicialUrl, $fotoMuertesInicialesUrl
        ]);
        
        sendResponse(true, 'Kill Points iniciales registrados exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando Kill Points iniciales: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando Kill Points iniciales: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>