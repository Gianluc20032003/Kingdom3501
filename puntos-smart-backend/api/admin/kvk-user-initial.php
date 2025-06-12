<?php
// admin/kvk-user-initial.php
// Endpoint para que administradores actualicen datos iniciales de KvK de un usuario

require_once '../config/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

// Verificar que el usuario es administrador
try {
    $adminUser = requireAdmin(); // Usa la función de config.php para validar JWT y admin
} catch (Exception $e) {
    sendResponse(false, 'Acceso no autorizado: ' . $e->getMessage(), null, 401);
}

// Validar user_id desde el parámetro de consulta
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
if (!$user_id) {
    sendResponse(false, 'El ID de usuario es requerido', null, 400);
}

// Validar campos de entrada
$kill_t4_iniciales = isset($_POST['kill_t4_iniciales']) ? (int)$_POST['kill_t4_iniciales'] : 0;
$kill_t5_iniciales = isset($_POST['kill_t5_iniciales']) ? (int)$_POST['kill_t5_iniciales'] : 0;
$muertes_propias_iniciales = isset($_POST['muertes_propias_iniciales']) ? (int)$_POST['muertes_propias_iniciales'] : 0;
$current_power = isset($_POST['current_power']) ? (int)$_POST['current_power'] : 0;

if ($kill_t4_iniciales < 0 || $kill_t5_iniciales < 0 || $muertes_propias_iniciales < 0 || $current_power < 0) {
    sendResponse(false, 'Todos los campos numéricos deben ser no negativos', null, 400);
}

try {
    $pdo = getDBConnection();

    // Verificar que el usuario existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Usuario no encontrado', null, 404);
    }

    // Verificar si ya existe un registro
    $stmt = $pdo->prepare("SELECT id, foto_inicial_url, foto_muertes_iniciales_url FROM kvk_datos WHERE usuario_id = ?");
    $stmt->execute([$user_id]);
    $existingRecord = $stmt->fetch();

    $foto_inicial_url = $existingRecord ? $existingRecord['foto_inicial_url'] : null;
    $foto_muertes_iniciales_url = $existingRecord ? $existingRecord['foto_muertes_iniciales_url'] : null;

    // Procesar foto_inicial
    if (isset($_FILES['foto_inicial']) && $_FILES['foto_inicial']['error'] === UPLOAD_ERR_OK) {
        try {
            $foto_inicial_url = uploadFile($_FILES['foto_inicial'], 'kvk');
            if ($existingRecord && $existingRecord['foto_inicial_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_inicial_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la foto inicial: ' . $e->getMessage(), null, 400);
        }
    } elseif (!$existingRecord) {
        sendResponse(false, 'La foto inicial es requerida para nuevos registros', null, 400);
    }

    // Procesar foto_muertes_iniciales
    if (isset($_FILES['foto_muertes_iniciales']) && $_FILES['foto_muertes_iniciales']['error'] === UPLOAD_ERR_OK) {
        try {
            $foto_muertes_iniciales_url = uploadFile($_FILES['foto_muertes_iniciales'], 'kvk');
            if ($existingRecord && $existingRecord['foto_muertes_iniciales_url']) {
                $oldPhotoPath = UPLOAD_DIR . $existingRecord['foto_muertes_iniciales_url'];
                if (file_exists($oldPhotoPath)) {
                    unlink($oldPhotoPath);
                }
            }
        } catch (Exception $e) {
            sendResponse(false, 'Error al subir la foto de muertes: ' . $e->getMessage(), null, 400);
        }
    } elseif (!$existingRecord) {
        sendResponse(false, 'La foto de muertes es requerida para nuevos registros', null, 400);
    }

    if ($existingRecord) {
        // Actualizar registro existente
        $stmt = $pdo->prepare("
            UPDATE kvk_datos 
            SET kill_t4_iniciales = ?, kill_t5_iniciales = ?, muertes_propias_iniciales = ?, 
                current_power = ?, foto_inicial_url = ?, foto_muertes_iniciales_url = ?, 
                fecha_registro = NOW()
            WHERE usuario_id = ?
        ");
        $stmt->execute([
            $kill_t4_iniciales, $kill_t5_iniciales, $muertes_propias_iniciales,
            $current_power, $foto_inicial_url, $foto_muertes_iniciales_url, $user_id
        ]);
    } else {
        // Insertar nuevo registro
        $stmt = $pdo->prepare("
            INSERT INTO kvk_datos (
                usuario_id, kill_t4_iniciales, kill_t5_iniciales, muertes_propias_iniciales, 
                current_power, foto_inicial_url, foto_muertes_iniciales_url, fecha_registro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $user_id, $kill_t4_iniciales, $kill_t5_iniciales, $muertes_propias_iniciales,
            $current_power, $foto_inicial_url, $foto_muertes_iniciales_url
        ]);
    }

    sendResponse(true, 'Datos iniciales actualizados exitosamente');
} catch (PDOException $e) {
    error_log('Error actualizando datos iniciales: ' . $e->getMessage());
    sendResponse(false, 'Error de base de datos', null, 500);
}
?>