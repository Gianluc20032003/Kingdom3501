<?php
// movilizacion/ranking.php
// Obtener ranking de movilización de alianza

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener ranking ordenado por puntos
    $stmt = $pdo->prepare("
        SELECT 
            u.nombre_usuario,
            ma.puntos,
            ma.foto_url,
            ma.cumple_minimo,
            ma.fecha_registro,
            CASE WHEN u.id = ? THEN 1 ELSE 0 END as es_usuario_actual
        FROM movilizacion_alianza ma
        INNER JOIN usuarios u ON ma.usuario_id = u.id
        ORDER BY ma.puntos DESC, ma.fecha_registro ASC
    ");
    
    $stmt->execute([$user->user_id]);
    $ranking = $stmt->fetchAll();
    
    sendResponse(true, 'Ranking obtenido exitosamente', $ranking);
    
} catch (Exception $e) {
    error_log('Error obteniendo ranking de movilización: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>