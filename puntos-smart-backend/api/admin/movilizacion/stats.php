<?php
// api/admin/movilizacion/stats.php
// Obtener estadísticas del evento de movilización

// Headers CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

// Solo admins pueden ver estadísticas
if (!$user->es_admin) {
    sendResponse(false, 'Acceso denegado. Se requieren permisos de administrador.', null, 403);
}

try {
    $pdo = getDBConnection();
    
    // Obtener estadísticas generales
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_participantes,
            COUNT(CASE WHEN cumple_minimo = 1 THEN 1 END) as participantes_completaron,
            COALESCE(SUM(puntos), 0) as puntos_totales,
            COALESCE(AVG(puntos), 0) as promedio_puntos
        FROM movilizacion_alianza
    ");
    $stmt->execute();
    $stats = $stmt->fetch();
    
    // Convertir a tipos correctos
    $stats['total_participantes'] = (int) $stats['total_participantes'];
    $stats['participantes_completaron'] = (int) $stats['participantes_completaron'];
    $stats['puntos_totales'] = (int) $stats['puntos_totales'];
    $stats['promedio_puntos'] = (float) $stats['promedio_puntos'];
    
    sendResponse(true, 'Estadísticas obtenidas exitosamente', $stats);
    
} catch (Exception $e) {
    error_log('Error obteniendo estadísticas de movilización: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>