<?php
// kvk/etapas.php
// Obtener etapas activas de KvK

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener todas las etapas activas
    $stmt = $pdo->query("
        SELECT 
            id, 
            nombre_etapa, 
            orden_etapa,
            fecha_creacion
        FROM kvk_etapas 
        WHERE activa = 1
        ORDER BY orden_etapa ASC
    ");
    $etapas = $stmt->fetchAll();
    
    // Para cada etapa, verificar si el usuario ya tiene datos
    $etapasConEstado = [];
    foreach ($etapas as $etapa) {
        $stmt = $pdo->prepare("
            SELECT id, fecha_registro
            FROM kvk_batallas 
            WHERE usuario_id = ? AND etapa_id = ?
        ");
        $stmt->execute([$user->user_id, $etapa['id']]);
        $batalla = $stmt->fetch();
        
        $etapasConEstado[] = [
            'id' => $etapa['id'],
            'nombre_etapa' => $etapa['nombre_etapa'],
            'orden_etapa' => $etapa['orden_etapa'],
            'fecha_creacion' => $etapa['fecha_creacion'],
            'completada' => $batalla !== false,
            'fecha_completada' => $batalla ? $batalla['fecha_registro'] : null
        ];
    }
    
    sendResponse(true, 'Etapas obtenidas exitosamente', $etapasConEstado);
    
} catch (Exception $e) {
    error_log('Error obteniendo etapas de KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>