<?php
// kvk/save-battle.php
// Guardar datos de batalla de KvK

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$rules = [
    'etapa_id' => ['required' => true, 'type' => 'int'],
    'kill_points' => ['required' => true, 'type' => 'int', 'min' => 0],
    'kill_t4' => ['required' => false, 'type' => 'int', 'min' => 0],
    'kill_t5' => ['required' => false, 'type' => 'int', 'min' => 0],
    'muertes_propias' => ['required' => false, 'type' => 'int', 'min' => 0]
];

$errors = validateInput($_POST, $rules);
if (!empty($errors)) {
    sendResponse(false, 'Datos inválidos', $errors, 400);
}

$etapaId = (int) $_POST['etapa_id'];
$killPoints = (int) $_POST['kill_points'];
$killT4 = (int) ($_POST['kill_t4'] ?? 0);
$killT5 = (int) ($_POST['kill_t5'] ?? 0);
$muertesPropias = (int) ($_POST['muertes_propias'] ?? 0);

try {
    $pdo = getDBConnection();
    
    // Verificar que la etapa existe y está activa
    $stmt = $pdo->prepare("
        SELECT id, nombre_etapa 
        FROM kvk_etapas 
        WHERE id = ? AND activa = 1
    ");
    $stmt->execute([$etapaId]);
    $etapa = $stmt->fetch();
    
    if (!$etapa) {
        sendResponse(false, 'La etapa especificada no existe o no está activa', null, 400);
    }
    
    // Verificar si ya existe un registro para esta etapa
    $stmt = $pdo->prepare("
        SELECT id, foto_batalla_url, foto_muertes_url 
        FROM kvk_batallas 
        WHERE usuario_id = ? AND etapa_id = ?
    ");
    $stmt->execute([$user->user_id, $etapaId]);
    $existingRecord = $stmt->fetch();
    
    $fotoBatallaUrl = null;
    $fotoMuertesUrl = null;
    
    // Procesar imagen de batalla si se subió
    if (isset($_FILES['foto_batalla']) && $_FILES['foto_batalla']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoBatallaUrl = uploadFile($_FILES['foto_batalla'], 'kvk');
            
            // Eliminar foto anterior si existe
            if ($existingRecord && $existingRecord['foto_batalla_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_batalla_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen de batalla: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        $fotoBatallaUrl = $existingRecord['foto_batalla_url'];
    }
    
    // Procesar imagen de muertes si se subió
    if (isset($_FILES['foto_muertes']) && $_FILES['foto_muertes']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoMuertesUrl = uploadFile($_FILES['foto_muertes'], 'kvk');
            
            // Eliminar foto anterior si existe
            if ($existingRecord && $existingRecord['foto_muertes_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_muertes_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen de muertes: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        $fotoMuertesUrl = $existingRecord['foto_muertes_url'];
    }
    
    // Validar que tenga al menos una foto para nuevos registros
    if (!$existingRecord && !$fotoBatallaUrl) {
        sendResponse(false, 'La foto de batalla es requerida', null, 400);
    }
    
    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE kvk_batallas 
            SET kill_points = ?, kill_t4 = ?, kill_t5 = ?, muertes_propias = ?, 
                foto_batalla_url = ?, foto_muertes_url = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $killPoints, $killT4, $killT5, $muertesPropias, 
            $fotoBatallaUrl, $fotoMuertesUrl, $existingRecord['id']
        ]);
        
        sendResponse(true, 'Datos de batalla actualizados exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO kvk_batallas 
            (usuario_id, etapa_id, kill_points, kill_t4, kill_t5, muertes_propias, foto_batalla_url, foto_muertes_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user->user_id, $etapaId, $killPoints, $killT4, $killT5, 
            $muertesPropias, $fotoBatallaUrl, $fotoMuertesUrl
        ]);
        
        sendResponse(true, 'Datos de batalla registrados exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando datos de batalla KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando datos de batalla KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>