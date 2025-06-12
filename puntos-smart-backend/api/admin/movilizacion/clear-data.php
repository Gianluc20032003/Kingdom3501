<?php
// api/admin/movilizacion/clear-data.php
// Eliminar todos los datos del evento de movilización

// Headers CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Solo admins pueden eliminar datos
if (!$user->es_admin) {
    sendResponse(false, 'Acceso denegado. Se requieren permisos de administrador.', null, 403);
}

try {
    $pdo = getDBConnection();
    $pdo->beginTransaction();
    
    // Obtener todas las fotos antes de eliminar registros
    $stmt = $pdo->prepare("SELECT foto_url FROM movilizacion_alianza WHERE foto_url IS NOT NULL");
    $stmt->execute();
    $fotos = $stmt->fetchAll();
    
    // Eliminar archivos de fotos del servidor
    $fotosEliminadas = 0;
    $erroresFotos = 0;
    
    foreach ($fotos as $foto) {
        $rutaFoto = UPLOAD_DIR . $foto['foto_url'];
        if (file_exists($rutaFoto)) {
            if (unlink($rutaFoto)) {
                $fotosEliminadas++;
            } else {
                $erroresFotos++;
                error_log("No se pudo eliminar la foto: " . $rutaFoto);
            }
        }
    }
    
    // Eliminar todos los registros de la base de datos
    $stmt = $pdo->prepare("DELETE FROM movilizacion_alianza");
    $registrosEliminados = $stmt->execute();
    $cantidadRegistros = $stmt->rowCount();
    
    // Reiniciar el auto_increment
    $stmt = $pdo->prepare("ALTER TABLE movilizacion_alianza AUTO_INCREMENT = 1");
    $stmt->execute();
    
    $pdo->commit();
    
    $mensaje = "Datos eliminados exitosamente. ";
    $mensaje .= "Registros eliminados: {$cantidadRegistros}. ";
    $mensaje .= "Fotos eliminadas: {$fotosEliminadas}";
    
    if ($erroresFotos > 0) {
        $mensaje .= ". Errores eliminando fotos: {$erroresFotos}";
    }
    
    // Log de la acción para auditoría
    error_log("Admin {$user->user_id} ({$user->nombre_usuario}) eliminó todos los datos de movilización. {$mensaje}");
    
    sendResponse(true, $mensaje, [
        'registros_eliminados' => $cantidadRegistros,
        'fotos_eliminadas' => $fotosEliminadas,
        'errores_fotos' => $erroresFotos
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    error_log('Error eliminando datos de movilización: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>