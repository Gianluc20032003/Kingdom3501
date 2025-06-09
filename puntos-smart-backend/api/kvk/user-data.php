<?php
// kvk/user-data.php
// Obtener datos del usuario para KvK

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    // Obtener datos iniciales de KvK del usuario (más reciente)
    $stmt = $pdo->prepare("
        SELECT kill_points_iniciales, foto_inicial_url, fecha_registro
        FROM kvk_datos 
        WHERE usuario_id = ?
        ORDER BY fecha_registro DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id]);
    $kvkInicial = $stmt->fetch();
    
    // Obtener todas las etapas activas ordenadas
    $stmt = $pdo->query("
        SELECT id, nombre_etapa, orden_etapa
        FROM kvk_etapas 
        WHERE activa = 1
        ORDER BY orden_etapa ASC
    ");
    $etapas = $stmt->fetchAll();
    
    // Obtener batallas del usuario por etapa
    $batallas = [];
    if (!empty($etapas)) {
        $etapaIds = array_column($etapas, 'id');
        $placeholders = str_repeat('?,', count($etapaIds) - 1) . '?';
        
        $stmt = $pdo->prepare("
            SELECT 
                kb.etapa_id,
                kb.kill_points,
                kb.kill_t4,
                kb.kill_t5,
                kb.muertes_propias,
                kb.foto_batalla_url,
                kb.foto_muertes_url,
                kb.fecha_registro,
                ke.nombre_etapa,
                ke.orden_etapa
            FROM kvk_batallas kb
            INNER JOIN kvk_etapas ke ON kb.etapa_id = ke.id
            WHERE kb.usuario_id = ? AND kb.etapa_id IN ($placeholders)
            ORDER BY ke.orden_etapa ASC
        ");
        $stmt->execute(array_merge([$user->user_id], $etapaIds));
        $batallasData = $stmt->fetchAll();
        
        // Organizar batallas por etapa_id
        foreach ($batallasData as $batalla) {
            $batallas[$batalla['etapa_id']] = $batalla;
        }
    }
    
    // Calcular progreso del KvK
    $progreso = [
        'tiene_datos_iniciales' => $kvkInicial !== false,
        'etapas_completadas' => count($batallas),
        'etapas_totales' => count($etapas),
        'porcentaje_completado' => count($etapas) > 0 ? round((count($batallas) / count($etapas)) * 100, 1) : 0
    ];
    
    $response = [
        'kvk_inicial' => $kvkInicial ?: null,
        'etapas' => $etapas,
        'batallas' => $batallas,
        'progreso' => $progreso
    ];
    
    sendResponse(true, 'Datos de KvK obtenidos exitosamente', $response);
    
} catch (Exception $e) {
    error_log('Error obteniendo datos de KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>