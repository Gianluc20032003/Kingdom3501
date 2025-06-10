<?php
// aoo/save.php
// Guardar inscripción AOO

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$cantidadTropas = $_POST['cantidad_tropas'] ?? null;
$puedeRally = isset($_POST['puede_liderar_rally']) ? 1 : 0;
$puedeGuarnicion = isset($_POST['puede_liderar_guarnicion']) ? 1 : 0;
$comandantesDisponibles = $_POST['comandantes_disponibles'] ?? '';
$configId = $_POST['config_id'] ?? null;

// Validaciones
if (empty($cantidadTropas) || !is_numeric($cantidadTropas) || $cantidadTropas < 0) {
    sendResponse(false, 'La cantidad de tropas debe ser un número válido mayor o igual a 0', null, 400);
}

if (empty($configId) || !is_numeric($configId)) {
    sendResponse(false, 'Configuración AOO inválida', null, 400);
}

if (empty($comandantesDisponibles)) {
    sendResponse(false, 'Debes especificar los comandantes disponibles', null, 400);
}

$cantidadTropas = (int) $cantidadTropas;

try {
    $pdo = getDBConnection();
    
    // Verificar que la configuración existe y está activa
    $stmt = $pdo->prepare("
        SELECT id, horario 
        FROM aoo_config 
        WHERE id = ? AND activo = 1
    ");
    $stmt->execute([$configId]);
    $config = $stmt->fetch();
    
    if (!$config) {
        sendResponse(false, 'La configuración AOO no existe o no está activa', null, 400);
    }
    
    // Verificar si ya existe una inscripción
    $stmt = $pdo->prepare("
        SELECT id, foto_comandantes_url 
        FROM aoo_inscripciones 
        WHERE usuario_id = ? AND aoo_config_id = ?
    ");
    $stmt->execute([$user->user_id, $configId]);
    $existingRecord = $stmt->fetch();
    
    $fotoUrl = null;
    
    // Procesar imagen si se subió una nueva
    if (isset($_FILES['foto_comandantes']) && $_FILES['foto_comandantes']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoUrl = uploadFile($_FILES['foto_comandantes'], 'aoo');
            
            // Si es una actualización y había una foto anterior, eliminarla
            if ($existingRecord && $existingRecord['foto_comandantes_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_comandantes_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        // Si es una actualización sin nueva foto, mantener la foto existente
        $fotoUrl = $existingRecord['foto_comandantes_url'];
    } else {
        // Si es un nuevo registro y no se subió foto
        sendResponse(false, 'La foto de comandantes es requerida para el registro inicial', null, 400);
    }
    
    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE aoo_inscripciones 
            SET foto_comandantes_url = ?, 
                cantidad_tropas = ?, 
                puede_liderar_rally = ?, 
                puede_liderar_guarnicion = ?, 
                comandantes_disponibles = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $fotoUrl, 
            $cantidadTropas, 
            $puedeRally, 
            $puedeGuarnicion, 
            $comandantesDisponibles, 
            $existingRecord['id']
        ]);
        
        sendResponse(true, 'Inscripción actualizada exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO aoo_inscripciones 
            (usuario_id, aoo_config_id, foto_comandantes_url, cantidad_tropas, puede_liderar_rally, puede_liderar_guarnicion, comandantes_disponibles)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user->user_id, 
            $configId, 
            $fotoUrl, 
            $cantidadTropas, 
            $puedeRally, 
            $puedeGuarnicion, 
            $comandantesDisponibles
        ]);
        
        sendResponse(true, 'Inscripción registrada exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando inscripción AOO: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando inscripción AOO: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>