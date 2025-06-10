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

    // Reemplazar la vista con una consulta directa para calcular la puntuación
    $stmt = $pdo->prepare("
        SELECT 
            COALESCE(kh.honor_cantidad, 0) AS honor_cantidad,
            COALESCE(SUM(kb.kill_t4), 0) AS total_kill_t4_batallas,
            COALESCE(SUM(kb.kill_t5), 0) AS total_kill_t5_batallas,
            COALESCE(SUM(kb.muertes_propias_t4), 0) AS total_muertes_t4_batallas,
            COALESCE(SUM(kb.muertes_propias_t5), 0) AS total_muertes_t5_batallas,
            COALESCE(kh.honor_cantidad, 0) * 5 AS puntos_honor,
            COALESCE(SUM(kb.kill_t4), 0) * 10 AS puntos_kill_t4,
            COALESCE(SUM(kb.kill_t5), 0) * 20 AS puntos_kill_t5,
            COALESCE(SUM(kb.muertes_propias_t4), 0) * 5 AS puntos_muertes_t4,
            COALESCE(SUM(kb.muertes_propias_t5), 0) * 10 AS puntos_muertes_t5,
            COALESCE(kh.honor_cantidad, 0) * 5 + 
            COALESCE(SUM(kb.kill_t4), 0) * 10 + 
            COALESCE(SUM(kb.kill_t5), 0) * 20 + 
            COALESCE(SUM(kb.muertes_propias_t4), 0) * 5 + 
            COALESCE(SUM(kb.muertes_propias_t5), 0) * 10 AS puntuacion_total
        FROM 
            (`usuarios` u 
            LEFT JOIN `kvk_datos` kd ON u.id = kd.usuario_id) 
            LEFT JOIN `kvk_honor` kh ON u.id = kh.usuario_id 
            LEFT JOIN `kvk_batallas` kb ON u.id = kb.usuario_id 
        WHERE 
            u.id = ? AND u.es_admin = 0 
        GROUP BY 
            u.id, u.nombre_usuario, kd.kill_t4_iniciales, kd.kill_t5_iniciales, 
            kd.muertes_propias_iniciales, kh.honor_cantidad
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