<?php
// kvk/save-battle.php
// Guardar datos de batalla en KvK

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Validar entrada
$etapaId = $_POST['etapa_id'] ?? null;
$killT4 = $_POST['kill_t4'] ?? 0;
$killT5 = $_POST['kill_t5'] ?? 0;
$muertesPropiasT4 = $_POST['muertes_propias_t4'] ?? 0;
$muertesPropiasT5 = $_POST['muertes_propias_t5'] ?? 0;

// Validaciones
if (empty($etapaId) || !is_numeric($etapaId)) {
    sendResponse(false, 'Debe seleccionar una etapa válida', null, 400);
}

if (!is_numeric($muertesPropiasT4) || $muertesPropiasT4 < 0) {
    sendResponse(false, 'Las muertes propias T4 deben ser un número válido mayor o igual a 0', null, 400);
}
if (!is_numeric($muertesPropiasT5) || $muertesPropiasT5 < 0) {
    sendResponse(false, 'Las muertes propias T5 deben ser un número válido mayor o igual a 0', null, 400);
}

$killT4 = (int) $killT4;
$killT5 = (int) $killT5;
$muertesPropiasT4 = (int) $muertesPropiasT4;
$muertesPropiasT5 = (int) $muertesPropiasT5;

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
        sendResponse(false, 'La etapa seleccionada no existe o no está activa', null, 400);
    }

    // Verificar si ya existe un registro para este usuario y etapa
    $stmt = $pdo->prepare("
        SELECT id, foto_batalla_url, foto_muertes_url 
        FROM kvk_batallas 
        WHERE usuario_id = ? AND etapa_id = ?
    ");
    $stmt->execute([$user->user_id, $etapaId]);
    $existingRecord = $stmt->fetch();

    $fotoBatallaUrl = null;
    $fotoMuertesUrl = null;

    // Procesar imagen de batalla
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
    } else {
        sendResponse(false, 'La foto de batalla es requerida', null, 400);
    }

    // Procesar imagen de muertes
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
    } else {
        sendResponse(false, 'La foto de muertes es requerida', null, 400);
    }

    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE kvk_batallas 
            SET kill_t4 = ?, kill_t5 = ?, 
                muertes_propias_t4 = ?, muertes_propias_t5 = ?, 
                foto_batalla_url = ?, foto_muertes_url = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $killT4,
            $killT5,
            $muertesPropiasT4,
            $muertesPropiasT5,
            $fotoBatallaUrl,
            $fotoMuertesUrl,
            $existingRecord['id']
        ]);

        sendResponse(true, 'Datos de batalla actualizados exitosamente');
    } else {
        // Crear nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO kvk_batallas (
                usuario_id, etapa_id, kill_t4, kill_t5, 
                muertes_propias_t4, muertes_propias_t5, 
                foto_batalla_url, foto_muertes_url
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user->user_id,
            $etapaId,
            $killT4,
            $killT5,
            $muertesPropiasT4,
            $muertesPropiasT5,
            $fotoBatallaUrl,
            $fotoMuertesUrl
        ]);

        sendResponse(true, 'Datos de batalla registrados exitosamente');
    }
} catch (PDOException $e) {
    error_log('Error guardando datos de batalla: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error guardando datos de batalla: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}