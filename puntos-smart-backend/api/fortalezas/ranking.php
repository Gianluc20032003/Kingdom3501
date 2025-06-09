<?php
// fortalezas/ranking.php
// Obtener ranking de fortalezas bárbaras

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();
    
    $currentWeek = getCurrentWeek();
    $currentYear = getCurrentYear();
    $previousWeek = $currentWeek - 1;
    $previousYear = $currentYear;
    
    // Ajustar para el caso donde la semana anterior está en el año anterior
    if ($previousWeek <= 0) {
        $previousWeek = 52;
        $previousYear = $currentYear - 1;
    }
    
    // Obtener ranking con datos de ambas semanas
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nombre_usuario,
            fb_current.cantidad_cofres as cofres_semana_actual,
            fb_current.foto_url as foto_semana_actual,
            fb_previous.cantidad_cofres as cofres_semana_pasada,
            fb_previous.foto_url as foto_semana_pasada,
            CASE 
                WHEN fb_current.cantidad_cofres IS NOT NULL AND fb_previous.cantidad_cofres IS NOT NULL 
                THEN fb_current.cantidad_cofres - fb_previous.cantidad_cofres
                ELSE 0
            END as diferencia,
            CASE WHEN u.id = ? THEN 1 ELSE 0 END as es_usuario_actual
        FROM usuarios u
        LEFT JOIN fortalezas_barbaras fb_current ON (
            u.id = fb_current.usuario_id 
            AND fb_current.semana = ? 
            AND fb_current.ano = ?
        )
        LEFT JOIN fortalezas_barbaras fb_previous ON (
            u.id = fb_previous.usuario_id 
            AND fb_previous.semana = ? 
            AND fb_previous.ano = ?
        )
        WHERE 
            fb_current.cantidad_cofres IS NOT NULL 
            OR fb_previous.cantidad_cofres IS NOT NULL
        ORDER BY 
            CASE 
                WHEN fb_current.cantidad_cofres IS NOT NULL AND fb_previous.cantidad_cofres IS NOT NULL 
                THEN fb_current.cantidad_cofres - fb_previous.cantidad_cofres
                ELSE 0
            END DESC,
            fb_current.cantidad_cofres DESC
    ");
    
    $stmt->execute([
        $user->user_id, 
        $currentWeek, 
        $currentYear, 
        $previousWeek, 
        $previousYear
    ]);
    
    $ranking = $stmt->fetchAll();
    
    // Filtrar usuarios que solo tienen una semana registrada
    $filteredRanking = [];
    foreach ($ranking as $player) {
        // Solo incluir si tiene ambas semanas o si es la primera participación válida
        if ($player['cofres_semana_actual'] !== null && $player['cofres_semana_pasada'] !== null) {
            $filteredRanking[] = $player;
        } else if ($player['cofres_semana_actual'] !== null && $player['cofres_semana_pasada'] === null) {
            // Primera participación - incluir pero con diferencia 0
            $player['diferencia'] = 0;
            $filteredRanking[] = $player;
        }
    }
    
    sendResponse(true, 'Ranking obtenido exitosamente', $filteredRanking);
    
} catch (Exception $e) {
    error_log('Error obteniendo ranking de fortalezas: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>