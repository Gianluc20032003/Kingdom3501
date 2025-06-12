<?php
// admin/kvk-battle.php
// Admin endpoint to update user's KvK battle data

require_once '../config/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

// Check if user is admin
session_start();
if (!isset($_SESSION['user_id']) || !$_SESSION['es_admin']) {
    sendResponse(false, 'Unauthorized access', null, 401);
}

// Validate query parameters
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
$etapa_id = isset($_GET['etapa_id']) ? (int)$_GET['etapa_id'] : null;

if (!$user_id || !$etapa_id) {
    sendResponse(false, 'User ID and Etapa ID are required', null, 400);
}

// Validate input fields
$kill_t4 = isset($_POST['kill_t4']) ? (int)$_POST['kill_t4'] : 0;
$kill_t5 = isset($_POST['kill_t5']) ? (int)$_POST['kill_t5'] : 0;
$muertes_propias_t4 = isset($_POST['own_deaths_t4']) ? (int)$_POST['own_deaths_t4'] : 0;
$muertes_propias_t5 = isset($_POST['own_deaths_t5']) ? (int)$_POST['own_deaths_t5'] : 0;

if ($kill_t4 < 0 || $kill_t5 < 0 || $muertes_propias_t4 < 0 || $muertes_propias_t5 < 0) {
    sendResponse(false, 'All numeric fields must be non-negative', null, 400);
}

// Calculate kill_points
$kill_points = ($kill_t4 * 10) + ($kill_t5 * 20) - ($muertes_propias_t4 * 5) - ($muertes_propias_t5 * 10);

try {
    $pdo = getDBConnection();

    // Verify user exists
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'User not found', null, 404);
    }

    // Verify etapa exists and is active
    $stmt = $pdo->prepare("SELECT id FROM kvk_etapas WHERE id = ? AND activa = 1");
    $stmt->execute([$etapa_id]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Etapa not found or not active', null, 404);
    }

    // Check for existing record
    $stmt = $pdo->prepare("SELECT id, foto_batalla_url, foto_muertes_url FROM kvk_batallas WHERE usuario_id = ? AND etapa_id = ?");
    $stmt->execute([$user_id, $etapa_id]);
    $existingRecord = $stmt->fetch();

    $foto_batalla_url = $existingRecord ? $existingRecord['foto_batalla_url'] : null;
    $foto_muertes_url = $existingRecord ? $existingRecord['foto_muertes_url'] : null;

    // Process battle_photo
    if (isset($_FILES['battle_photo']) && $_FILES['battle_photo']['error'] === UPLOAD_ERR_OK) {
        try {
            $foto_batalla_url = uploadFile($_FILES['battle_photo'], 'kvk');
            if ($existingRecord && $existingRecord['foto_batalla_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_batalla_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error uploading battle photo: ' . $e->getMessage(), null, 400);
        }
    } elseif (!$existingRecord) {
        sendResponse(false, 'Battle photo is required for new records', null, 400);
    }

    // Process deaths_photo
    if (isset($_FILES['deaths_photo']) && $_FILES['deaths_photo']['error'] === UPLOAD_ERR_OK) {
        try {
            $foto_muertes_url = uploadFile($_FILES['deaths_photo'], 'kvk');
            if ($existingRecord && $existingRecord['foto_muertes_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_muertes_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error uploading deaths photo: ' . $e->getMessage(), null, 400);
        }
    } elseif (!$existingRecord) {
        sendResponse(false, 'Deaths photo is required for new records', null, 400);
    }

    if ($existingRecord) {
        // Update existing record
        $stmt = $pdo->prepare("
            UPDATE kvk_batallas 
            SET kill_t4 = ?, kill_t5 = ?, muertes_propias_t4 = ?, muertes_propias_t5 = ?, 
                kill_points = ?, foto_batalla_url = ?, foto_muertes_url = ?, fecha_registro = NOW()
            WHERE usuario_id = ? AND etapa_id = ?
        ");
        $stmt->execute([
            $kill_t4, $kill_t5, $muertes_propias_t4, $muertes_propias_t5,
            $kill_points, $foto_batalla_url, $foto_muertes_url, $user_id, $etapa_id
        ]);
    } else {
        // Insert new record
        $stmt = $pdo->prepare("
            INSERT INTO kvk_batallas (
                usuario_id, etapa_id, kill_t4, kill_t5, muertes_propias_t4, muertes_propias_t5, 
                kill_points, foto_batalla_url, foto_muertes_url, fecha_registro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $user_id, $etapa_id, $kill_t4, $kill_t5, $muertes_propias_t4, $muertes_propias_t5,
            $kill_points, $foto_batalla_url, $foto_muertes_url
        ]);
    }

    sendResponse(true, 'Battle data updated successfully');
} catch (PDOException $e) {
    error_log('Error updating battle data: ' . $e->getMessage());
    sendResponse(false, 'Database error', null, 500);
}
?>