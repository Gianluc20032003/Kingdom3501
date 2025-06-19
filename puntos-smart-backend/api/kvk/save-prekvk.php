<?php
// api/kvk/save-prekvk.php
// Guardar datos de Pre-KvK

// Headers CORS - AGREGADO
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request - AGREGADO
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Verificar si el módulo Pre-KvK está bloqueado
try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT valor FROM kvk_configuraciones 
        WHERE nombre_configuracion = 'prekvk_bloqueado' AND activa = 1
    ");
    $stmt->execute();
    $config = $stmt->fetch();
    
    if ($config && $config['valor'] === '1') {
        sendResponse(false, 'El registro de Pre-KvK está temporalmente deshabilitado', null, 403);
    }
    
} catch (Exception $e) {
    // Si hay error verificando configuración, permitir el registro
}

// Validar entrada
$puntosKvk = $_POST['puntos_kvk'] ?? null;

if (empty($puntosKvk) || !is_numeric($puntosKvk) || $puntosKvk < 0) {
    sendResponse(false, 'Los puntos de KvK deben ser un número válido mayor o igual a 0', null, 400);
}

$puntosKvk = (int) $puntosKvk;

try {
    // Verificar si ya existe un registro para este usuario
    $stmt = $pdo->prepare("
        SELECT id, foto_puntos_kvk_url 
        FROM kvk_pre_kvk 
        WHERE usuario_id = ?
    ");
    $stmt->execute([$user->user_id]);
    $existingRecord = $stmt->fetch();
    
    $fotoUrl = null;
    
    // Procesar imagen si se subió una nueva
    if (isset($_FILES['foto_puntos_kvk']) && $_FILES['foto_puntos_kvk']['error'] === UPLOAD_ERR_OK) {
        try {
            $fotoUrl = uploadFile($_FILES['foto_puntos_kvk'], 'kvk/prekvk');
            
            // Si es una actualización y había una foto anterior, eliminarla
            if ($existingRecord && $existingRecord['foto_puntos_kvk_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_puntos_kvk_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la imagen: ' . $e->getMessage(), null, 400);
        }
    } else if ($existingRecord) {
        // Si es una actualización sin nueva foto, mantener la foto existente
        $fotoUrl = $existingRecord['foto_puntos_kvk_url'];
    } else {
        // Si es un nuevo registro y no se subió foto
        sendResponse(false, 'La foto de puntos KvK es requerida para el registro inicial', null, 400);
    }
    
    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE kvk_pre_kvk 
            SET puntos_kvk = ?, foto_puntos_kvk_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$puntosKvk, $fotoUrl, $existingRecord['id']]);
        
        sendResponse(true, 'Datos de Pre-KvK actualizados exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO kvk_pre_kvk (usuario_id, puntos_kvk, foto_puntos_kvk_url)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user->user_id, $puntosKvk, $fotoUrl]);
        
        sendResponse(true, 'Datos de Pre-KvK registrados exitosamente');
    }
    
} catch (PDOException $e) {
    error_log('Error guardando datos Pre-KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando datos Pre-KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>