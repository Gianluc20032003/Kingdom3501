<?php
// kvk/user-data.php
// Obtener datos del usuario para KvK (ACTUALIZADO CON CURRENT_POWER)

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = getAuthenticatedUser();

try {
    $pdo = getDBConnection();

    // Obtener datos iniciales de KvK del usuario (AGREGADO CURRENT_POWER)
    $stmt = $pdo->prepare("
        SELECT 
            kill_t4_iniciales, 
            kill_t5_iniciales, 
            muertes_propias_iniciales, 
            current_power,
            foto_inicial_url, 
            foto_muertes_iniciales_url, 
            fecha_registro
        FROM kvk_datos 
        WHERE usuario_id = ?
        ORDER BY fecha_registro DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id]);
    $kvkData = $stmt->fetch();

    // Obtener datos de honor del usuario
    $stmt = $pdo->prepare("
        SELECT 
            honor_cantidad, 
            foto_honor_url, 
            fecha_registro
        FROM kvk_honor 
        WHERE usuario_id = ?
        LIMIT 1
    ");
    $stmt->execute([$user->user_id]);
    $honorData = $stmt->fetch();

    // Obtener etapas disponibles
    $stmt = $pdo->query("
        SELECT id, nombre_etapa, orden_etapa, activa
        FROM kvk_etapas 
        ORDER BY orden_etapa ASC
    ");
    $etapas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener batallas del usuario por etapa
    $batallas = [];
    if (!empty($etapas)) {
        $stmt = $pdo->prepare("
            SELECT 
                kb.etapa_id,
                kb.kill_points,
                kb.kill_t4,
                kb.kill_t5,
                kb.muertes_propias_t4,
                kb.muertes_propias_t5,
                kb.foto_batalla_url,
                kb.foto_muertes_url,
                kb.fecha_registro,
                ke.nombre_etapa
            FROM kvk_batallas kb
            INNER JOIN kvk_etapas ke ON kb.etapa_id = ke.id
            WHERE kb.usuario_id = ?
            ORDER BY ke.orden_etapa ASC
        ");
        $stmt->execute([$user->user_id]);
        $batallas = $stmt->fetchAll();
    }

    // Obtener puntuación del usuario usando la vista
    $stmt = $pdo->prepare("
        SELECT 
            honor_cantidad,
            total_kill_t4_batallas,
            total_kill_t5_batallas,
            total_muertes_t4_batallas,
            total_muertes_t5_batallas,
            puntos_honor,
            puntos_kill_t4,
            puntos_kill_t5,
            puntos_muertes_t4,
            puntos_muertes_t5,
            puntuacion_total
        FROM vw_puntuacion_usuarios 
        WHERE usuario_id = ?
    ");
    $stmt->execute([$user->user_id]);
    $puntuacion = $stmt->fetch();

    $response = [
        'kvk_inicial' => $kvkData ?: null,
        'honor_data' => $honorData ?: null,
        'etapas' => $etapas,
        'batallas' => $batallas,
        'puntuacion' => $puntuacion ?: null
    ];

    sendResponse(true, 'Datos de KvK obtenidos exitosamente', $response);
} catch (Exception $e) {
    error_log('Error obteniendo datos de KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
