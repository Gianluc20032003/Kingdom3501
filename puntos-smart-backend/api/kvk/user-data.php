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

    // Obtener datos iniciales de KvK del usuario
    $stmt = $pdo->prepare("
        SELECT kill_points_iniciales, muertes_propias_iniciales, 
               foto_inicial_url, foto_muertes_iniciales_url, fecha_registro
        FROM kvk_datos 
        WHERE usuario_id = ?
        ORDER BY fecha_registro DESC
        LIMIT 1
    ");
    $stmt->execute([$user->user_id]);
    $kvkData = $stmt->fetch();

    // Obtener etapas disponibles
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

    $response = [
        'kvk_inicial' => $kvkData ?: null,
        'etapas' => $etapas,
        'batallas' => $batallas
    ];

    sendResponse(true, 'Datos de KvK obtenidos exitosamente', $response);
} catch (Exception $e) {
    error_log('Error obteniendo datos de KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
