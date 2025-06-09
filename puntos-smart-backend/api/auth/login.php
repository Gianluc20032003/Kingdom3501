<?php
// auth/login.php
// Endpoint para iniciar sesión

require_once '../config/config.php';
require_once '../config/jwt_helper.php';  // 👈 Importar JWT helper

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validar entrada
$rules = [
    'username' => ['required' => true, 'type' => 'string', 'min_length' => 3],
    'password' => ['required' => true, 'type' => 'string', 'min_length' => 6]
];

$errors = validateInput($input, $rules);
if (!empty($errors)) {
    sendResponse(false, 'Datos inválidos', $errors, 400);
}

$username = trim($input['username']);
$password = $input['password'];

try {
    $pdo = getDBConnection();
    
    // Buscar usuario por ID o nombre de usuario
    $stmt = $pdo->prepare("
        SELECT id, user_id, nombre_usuario, password, es_admin 
        FROM usuarios 
        WHERE user_id = ? OR nombre_usuario = ?
    ");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        sendResponse(false, 'Credenciales inválidas', null, 401);
    }
    
    // Generar JWT token
    $payload = [
        'user_id' => $user['id'],
        'username' => $user['nombre_usuario'],
        'es_admin' => (bool) $user['es_admin']
    ];
    
    $token = JWTHelper::encode($payload);
    
    // Datos del usuario para el frontend
    $userData = [
        'id' => $user['id'],
        'user_id' => $user['user_id'],
        'nombre_usuario' => $user['nombre_usuario'],
        'es_admin' => (bool) $user['es_admin']
    ];
    
    sendResponse(true, 'Inicio de sesión exitoso', [
        'token' => $token,
        'user' => $userData
    ]);
    
} catch (Exception $e) {
    error_log('Error en login: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>