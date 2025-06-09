<?php
// admin/aoo-stats.php
// Obtener estadísticas de AOO (solo admin)

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

// Solo admins pueden acceder
$user = requireAdmin();

try {
    $pdo = getDBConnection();
    
    // Obtener evento activo
    $stmt = $pdo->prepare("
        SELECT id, horario 
        FROM aoo_config 
        WHERE activo = 1 
        LIMIT 1
    ");
    $stmt->execute();
    $eventoActivo = $stmt->fetch();
    
    if (!$eventoActivo) {
        sendResponse(true, 'No hay evento activo', [
            'evento_activo' => null,
            'estadisticas' => null
        ]);
    }
    
    // Estadísticas del evento activo
    $eventId = $eventoActivo['id'];
    
    // Total de inscritos
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM aoo_inscripciones 
        WHERE aoo_config_id = ?
    ");
    $stmt->execute([$eventId]);
    $totalInscritos = $stmt->fetch()['total'];
    
    // Líderes de rally
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM aoo_inscripciones 
        WHERE aoo_config_id = ? AND puede_liderar_rally = 1
    ");
    $stmt->execute([$eventId]);
    $lideresRally = $stmt->fetch()['total'];
    
    // Líderes de guarnición
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM aoo_inscripciones 
        WHERE aoo_config_id = ? AND puede_liderar_guarnicion = 1
    ");
    $stmt->execute([$eventId]);
    $lideresGuarnicion = $stmt->fetch()['total'];
    
    // Total de tropas
    $stmt = $pdo->prepare("
        SELECT SUM(cantidad_tropas) as total 
        FROM aoo_inscripciones 
        WHERE aoo_config_id = ?
    ");
    $stmt->execute([$eventId]);
    $totalTropas = $stmt->fetch()['total'] ?? 0;
    
    // Promedio de tropas por jugador
    $promedioTropas = $totalInscritos > 0 ? round($totalTropas / $totalInscritos) : 0;
    
    // Top 5 usuarios con más tropas
    $stmt = $pdo->prepare("
        SELECT 
            u.nombre_usuario,
            ai.cantidad_tropas,
            ai.puede_liderar_rally,
            ai.puede_liderar_guarnicion
        FROM aoo_inscripciones ai
        INNER JOIN usuarios u ON ai.usuario_id = u.id
        WHERE ai.aoo_config_id = ?
        ORDER BY ai.cantidad_tropas DESC
        LIMIT 5
    ");
    $stmt->execute([$eventId]);
    $topJugadores = $stmt->fetchAll();
    
    // Inscripciones por día (últimos 7 días)
    $stmt = $pdo->prepare("
        SELECT 
            DATE(fecha_inscripcion) as fecha,
            COUNT(*) as inscripciones
        FROM aoo_inscripciones 
        WHERE aoo_config_id = ? 
            AND fecha_inscripcion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(fecha_inscripcion)
        ORDER BY fecha DESC
    ");
    $stmt->execute([$eventId]);
    $inscripcionesPorDia = $stmt->fetchAll();
    
    $estadisticas = [
        'total_inscritos' => $totalInscritos,
        'lideres_rally' => $lideresRally,
        'lideres_guarnicion' => $lideresGuarnicion,
        'total_tropas' => $totalTropas,
        'promedio_tropas' => $promedioTropas,
        'top_jugadores' => $topJugadores,
        'inscripciones_por_dia' => $inscripcionesPorDia
    ];
    
    sendResponse(true, 'Estadísticas obtenidas', [
        'evento_activo' => $eventoActivo,
        'estadisticas' => $estadisticas
    ]);
    
} catch (Exception $e) {
    error_log('Error obteniendo estadísticas AOO: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>