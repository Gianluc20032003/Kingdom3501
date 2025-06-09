<?php
// mge/save.php
// Guardar postulación MGE

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$comandantePrincipal = $_POST['comandante_principal'] ?? '';
$comandantePareja = $_POST['comandante_pareja'] ?? '';

if (empty($comandantePrincipal)) {
    sendResponse(false, 'El comandante principal es requerido', null, 400);
}

try {
    $pdo = getDBConnection();
    
    // Obtener configuración activa
    $stmt = $pdo->prepare("
        SELECT id FROM mge_config 
        WHERE activo = 1 
        ORDER BY fecha_creacion DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $config = $stmt->fetch();
    
    if (!$config) {
        sendResponse(false, 'No hay eventos MGE activos', null, 404);
    }
    
    $configId = $config['id'];
    
    // Verificar si ya existe una postulación
    $stmt = $pdo->prepare("
        SELECT id, foto_equipamiento_url, foto_inscripciones_url, foto_comandantes_url, foto_cabezas_url
        FROM mge_postulaciones 
        WHERE usuario_id = ? AND mge_config_id = ?
    ");
    $stmt->execute([$user->user_id, $configId]);
    $existingRecord = $stmt->fetch();
    
    // Procesar archivos subidos
    $fotos = [
        'equipamiento' => null,
        'inscripciones' => null, 
        'comandantes' => null,
        'cabezas' => null
    ];
    
    $fotosFields = [
        'foto_equipamiento' => 'equipamiento',
        'foto_inscripciones' => 'inscripciones',
        'foto_comandantes' => 'comandantes', 
        'foto_cabezas' => 'cabezas'
    ];
    
    foreach ($fotosFields as $fieldName => $folderName) {
        if (isset($_FILES[$fieldName]) && $_FILES[$fieldName]['error'] === UPLOAD_ERR_OK) {
            try {
                $fotos[$folderName] = uploadFile($_FILES[$fieldName], 'mge');
                
                // Si es actualización, eliminar foto anterior
                if ($existingRecord && $existingRecord["foto_{$folderName}_url"]) {
                    $oldPhotoPath = UPLOAD_DIR . $existingRecord["foto_{$folderName}_url"];
                    if (file_exists($oldPhotoPath)) {
                        unlink($oldPhotoPath);
                    }
                }
            } catch (Exception $e) {
                sendResponse(false, "Error al subir foto de {$folderName}: " . $e->getMessage(), null, 400);
            }
        } else if ($existingRecord) {
            // Mantener foto existente si no se subió nueva
            $fotos[$folderName] = $existingRecord["foto_{$folderName}_url"];
        }
    }
    
    // Validar que al menos para nuevo registro se suban todas las fotos
    if (!$existingRecord) {
        foreach ($fotos as $tipo => $url) {
            if (!$url) {
                sendResponse(false, "La foto de {$tipo} es requerida para el registro inicial", null, 400);
            }
        }
    }
    
    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE mge_postulaciones 
            SET foto_equipamiento_url = ?, foto_inscripciones_url = ?, foto_comandantes_url = ?, 
                foto_cabezas_url = ?, comandante_principal = ?, comandante_pareja = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $fotos['equipamiento'],
            $fotos['inscripciones'], 
            $fotos['comandantes'],
            $fotos['cabezas'],
            $comandantePrincipal,
            $comandantePareja,
            $existingRecord['id']
        ]);
        
        sendResponse(true, 'Postulación MGE actualizada exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO mge_postulaciones 
            (usuario_id, mge_config_id, foto_equipamiento_url, foto_inscripciones_url, 
             foto_comandantes_url, foto_cabezas_url, comandante_principal, comandante_pareja)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user->user_id,
            $configId,
            $fotos['equipamiento'],
            $fotos['inscripciones'],
            $fotos['comandantes'], 
            $fotos['cabezas'],
            $comandantePrincipal,
            $comandantePareja
        ]);
        
        sendResponse(true, 'Postulación MGE registrada exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando postulación MGE: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando postulación MGE: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>