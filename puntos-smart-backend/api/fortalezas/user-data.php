<?php
// fortalezas/user-data.php
// Obtener datos del usuario para fortalezas bárbaras

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
        $previousWeek = 52; // o 53 dependiendo del año
        $previousYear = $currentYear - 1;
    }
    
    // Obtener datos de la semana actual
    $stmt = $pdo->prepare("
        SELECT cantidad_cofres, foto_url, fecha_registro
        FROM fortalezas_barbaras 
        WHERE usuario_id = ? AND semana = ? AND ano = ?
    ");
    $stmt->execute([$user->user_id, $currentWeek, $currentYear]);
    $currentWeekData = $stmt->fetch();
    
    // Obtener datos de la semana anterior
    $stmt = $pdo->prepare("
        SELECT cantidad_cofres, foto_url, fecha_registro
        FROM fortalezas_barbaras 
        WHERE usuario_id = ? AND semana = ? AND ano = ?
    ");
    $stmt->execute([$user->user_id, $previousWeek, $previousYear]);
    $previousWeekData = $stmt->fetch();
    
    $response = [
        'current_week' => $currentWeekData ?: null,
        'previous_week' => $previousWeekData ?: null,
        'week_number' => $currentWeek,
        'year' => $currentYear
    ];
    
    sendResponse(true, 'Datos obtenidos exitosamente', $response);
    
} catch (Exception $e) {
    error_log('Error obteniendo datos de fortalezas: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>