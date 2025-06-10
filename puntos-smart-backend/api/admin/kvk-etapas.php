<?php
// admin/kvk-etapas.php - ACTUALIZADO CON PUNTUACIÓN
// Gestión de etapas de KvK y datos de usuarios con sistema de puntuación

require_once '../config/config.php';

$user = requireAdmin(); // Solo admins pueden acceder

$method = $_SERVER['REQUEST_METHOD'];
$type = $_GET['type'] ?? '';

try {
    $pdo = getDBConnection();

    if ($method === 'GET' && $type === 'user_data') {
        // Obtener datos completos de usuarios con puntuación
        $stmt = $pdo->query("
            SELECT 
                u.id,
                u.nombre_usuario,
                
                -- Datos iniciales
                kd.kill_t4_iniciales,
                kd.kill_t5_iniciales,
                kd.muertes_propias_iniciales,
                kd.foto_inicial_url,
                kd.foto_muertes_iniciales_url,
                kd.fecha_registro as fecha_inicial,
                
                -- Honor
                kh.honor_cantidad,
                kh.foto_honor_url,
                kh.fecha_registro as fecha_honor,
                
                -- Puntuación desde la vista
                vp.total_kill_t4_batallas,
                vp.total_kill_t5_batallas,
                vp.total_muertes_t4_batallas,
                vp.total_muertes_t5_batallas,
                vp.puntos_honor,
                vp.puntos_kill_t4,
                vp.puntos_kill_t5,
                vp.puntos_muertes_t4,
                vp.puntos_muertes_t5,
                vp.puntuacion_total
                
            FROM usuarios u
            LEFT JOIN kvk_datos kd ON u.id = kd.usuario_id
            LEFT JOIN kvk_honor kh ON u.id = kh.usuario_id
            LEFT JOIN vw_puntuacion_usuarios vp ON u.id = vp.usuario_id
            WHERE u.es_admin = 0
            ORDER BY vp.puntuacion_total DESC NULLS LAST, u.nombre_usuario ASC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $userData = [];
        foreach ($users as $u) {
            // Fetch battle data
            $stmt = $pdo->prepare("
                SELECT 
                    kb.etapa_id, kb.kill_points, kb.kill_t4, kb.kill_t5,
                    kb.muertes_propias_t4, kb.muertes_propias_t5,
                    kb.foto_batalla_url, kb.foto_muertes_url, kb.fecha_registro,
                    ke.nombre_etapa, ke.orden_etapa
                FROM kvk_batallas kb
                INNER JOIN kvk_etapas ke ON kb.etapa_id = ke.id
                WHERE kb.usuario_id = ?
                ORDER BY ke.orden_etapa ASC
            ");
            $stmt->execute([$u['id']]);
            $batallas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $userData[] = [
                'id' => $u['id'],
                'nombre_usuario' => $u['nombre_usuario'],
                'initial' => [
                    'kill_t4_iniciales' => $u['kill_t4_iniciales'],
                    'kill_t5_iniciales' => $u['kill_t5_iniciales'],
                    'muertes_propias_iniciales' => $u['muertes_propias_iniciales'],
                    'foto_inicial_url' => $u['foto_inicial_url'],
                    'foto_muertes_iniciales_url' => $u['foto_muertes_iniciales_url'],
                    'fecha_registro' => $u['fecha_inicial']
                ],
                'honor' => [
                    'honor_cantidad' => $u['honor_cantidad'],
                    'foto_honor_url' => $u['foto_honor_url'],
                    'fecha_registro' => $u['fecha_honor']
                ],
                'puntuacion' => [
                    'honor_cantidad' => $u['honor_cantidad'] ?? 0,
                    'total_kill_t4_batallas' => $u['total_kill_t4_batallas'] ?? 0,
                    'total_kill_t5_batallas' => $u['total_kill_t5_batallas'] ?? 0,
                    'total_muertes_t4_batallas' => $u['total_muertes_t4_batallas'] ?? 0,
                    'total_muertes_t5_batallas' => $u['total_muertes_t5_batallas'] ?? 0,
                    'puntos_honor' => $u['puntos_honor'] ?? 0,
                    'puntos_kill_t4' => $u['puntos_kill_t4'] ?? 0,
                    'puntos_kill_t5' => $u['puntos_kill_t5'] ?? 0,
                    'puntos_muertes_t4' => $u['puntos_muertes_t4'] ?? 0,
                    'puntos_muertes_t5' => $u['puntos_muertes_t5'] ?? 0,
                    'puntuacion_total' => $u['puntuacion_total'] ?? 0
                ],
                'batallas' => $batallas
            ];
        }

        sendResponse(true, 'Datos de usuarios obtenidos exitosamente', ['users' => $userData]);
        exit;
    }

    if ($method === 'GET' && $type === 'ranking') {
        // Obtener ranking simplificado para tabla principal
        $stmt = $pdo->query("
            SELECT 
                usuario_id,
                nombre_usuario,
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
            ORDER BY puntuacion_total DESC
        ");
        $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, 'Ranking obtenido exitosamente', ['ranking' => $ranking]);
        exit;
    }

    // El resto del código para gestión de etapas permanece igual...
    switch ($method) {
        case 'GET':
            // Obtener todas las etapas
            $stmt = $pdo->query("
                SELECT id, nombre_etapa, orden_etapa, activa, fecha_creacion
                FROM kvk_etapas 
                ORDER BY orden_etapa ASC
            ");
            $etapas = $stmt->fetchAll();

            sendResponse(true, 'Etapas obtenidas exitosamente', ['etapas' => $etapas]);
            break;

        case 'POST':
            // Crear nueva etapa
            $input = json_decode(file_get_contents('php://input'), true);

            $nombreEtapa = trim($input['nombre_etapa'] ?? '');
            $ordenEtapa = (int)($input['orden_etapa'] ?? 0);

            if (empty($nombreEtapa)) {
                sendResponse(false, 'El nombre de la etapa es requerido', null, 400);
            }

            if ($ordenEtapa <= 0) {
                sendResponse(false, 'El orden de la etapa debe ser mayor a 0', null, 400);
            }

            // Verificar que no exista otra etapa con el mismo orden
            $stmt = $pdo->prepare("
                SELECT id FROM kvk_etapas WHERE orden_etapa = ?
            ");
            $stmt->execute([$ordenEtapa]);
            if ($stmt->fetch()) {
                sendResponse(false, 'Ya existe una etapa con ese orden', null, 409);
            }

            // Crear etapa
            $stmt = $pdo->prepare("
                INSERT INTO kvk_etapas (nombre_etapa, orden_etapa, activa)
                VALUES (?, ?, 1)
            ");
            $stmt->execute([$nombreEtapa, $ordenEtapa]);

            sendResponse(true, 'Etapa creada exitosamente');
            break;

        case 'PUT':
            // Actualizar etapa
            $input = json_decode(file_get_contents('php://input'), true);

            $etapaId = (int)($input['id'] ?? 0);
            $nombreEtapa = trim($input['nombre_etapa'] ?? '');
            $ordenEtapa = (int)($input['orden_etapa'] ?? 0);
            $activa = (bool)($input['activa'] ?? true);

            if ($etapaId <= 0) {
                sendResponse(false, 'ID de etapa inválido', null, 400);
            }

            if (empty($nombreEtapa)) {
                sendResponse(false, 'El nombre de la etapa es requerido', null, 400);
            }

            if ($ordenEtapa <= 0) {
                sendResponse(false, 'El orden de la etapa debe ser mayor a 0', null, 400);
            }

            // Verificar que la etapa existe
            $stmt = $pdo->prepare("SELECT id FROM kvk_etapas WHERE id = ?");
            $stmt->execute([$etapaId]);
            if (!$stmt->fetch()) {
                sendResponse(false, 'La etapa no existe', null, 404);
            }

            // Verificar que no exista otra etapa con el mismo orden (excluyendo la actual)
            $stmt = $pdo->prepare("
                SELECT id FROM kvk_etapas WHERE orden_etapa = ? AND id != ?
            ");
            $stmt->execute([$ordenEtapa, $etapaId]);
            if ($stmt->fetch()) {
                sendResponse(false, 'Ya existe otra etapa con ese orden', null, 409);
            }

            // Actualizar etapa
            $stmt = $pdo->prepare("
                UPDATE kvk_etapas 
                SET nombre_etapa = ?, orden_etapa = ?, activa = ?
                WHERE id = ?
            ");
            $stmt->execute([$nombreEtapa, $ordenEtapa, $activa ? 1 : 0, $etapaId]);

            sendResponse(true, 'Etapa actualizada exitosamente');
            break;

        case 'DELETE':
            // Eliminar etapa
            $input = json_decode(file_get_contents('php://input'), true);
            $etapaId = (int)($input['id'] ?? 0);

            if ($etapaId <= 0) {
                sendResponse(false, 'ID de etapa inválido', null, 400);
            }

            // Verificar que la etapa existe
            $stmt = $pdo->prepare("SELECT id FROM kvk_etapas WHERE id = ?");
            $stmt->execute([$etapaId]);
            if (!$stmt->fetch()) {
                sendResponse(false, 'La etapa no existe', null, 404);
            }

            // Verificar si hay batallas asociadas a esta etapa
            $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM kvk_batallas WHERE etapa_id = ?");
            $stmt->execute([$etapaId]);
            $result = $stmt->fetch();

            if ($result['total'] > 0) {
                sendResponse(false, 'No se puede eliminar la etapa porque tiene batallas asociadas', null, 409);
            }

            // Eliminar etapa
            $stmt = $pdo->prepare("DELETE FROM kvk_etapas WHERE id = ?");
            $stmt->execute([$etapaId]);

            sendResponse(true, 'Etapa eliminada exitosamente');
            break;

        default:
            sendResponse(false, 'Método no permitido', null, 405);
    }
} catch (PDOException $e) {
    error_log('Error en gestión de etapas KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
} catch (Exception $e) {
    error_log('Error en gestión de etapas KvK: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>