<?php
// auth/validate.php
// Endpoint para validar token JWT

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

try {
    $user = getAuthenticatedUser();
    
    // Obtener datos actualizados del usuario de la base de datos
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("
        SELECT id, user_id, nombre_usuario, es_admin 
        FROM usuarios 
        WHERE id = ?
    ");
    $stmt->execute([$user->user_id]);
    $userData = $stmt->fetch();
    
    if (!$userData) {
        sendResponse(false, 'Usuario no encontrado', null, 404);
    }
    
    $userResponse = [
        'id' => $userData['id'],
        'user_id' => $userData['user_id'],
        'nombre_usuario' => $userData['nombre_usuario'],
        'es_admin' => (bool) $userData['es_admin']
    ];
    
    sendResponse(true, 'Token válido', ['user' => $userResponse]);
    
} catch (Exception $e) {
    sendResponse(false, 'Token inválido', null, 401);
}
?>