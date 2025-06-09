<?php
// auth/register.php
// Endpoint para registrar nuevos usuarios

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validar entrada
$rules = [
    'user_id' => ['required' => true, 'type' => 'string', 'min_length' => 3, 'max_length' => 50],
    'username' => ['required' => true, 'type' => 'string', 'min_length' => 3, 'max_length' => 100],
    'password' => ['required' => true, 'type' => 'string', 'min_length' => 6]
];

$errors = validateInput($input, $rules);
if (!empty($errors)) {
    sendResponse(false, 'Datos inválidos', $errors, 400);
}

$user_id = trim($input['user_id']);
$username = trim($input['username']);
$password = $input['password'];

// Validaciones adicionales
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $user_id)) {
    sendResponse(false, 'El ID de usuario solo puede contener letras, números, guiones y guiones bajos', null, 400);
}

if (!preg_match('/^[a-zA-Z0-9_\s-]+$/', $username)) {
    sendResponse(false, 'El nombre de usuario contiene caracteres no válidos', null, 400);
}

try {
    $pdo = getDBConnection();
    
    // Verificar si el user_id ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE user_id = ?");
    $stmt->execute([$user_id]);
    if ($stmt->fetch()) {
        sendResponse(false, 'El ID de usuario ya existe', null, 409);
    }
    
    // Verificar si el nombre de usuario ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE nombre_usuario = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendResponse(false, 'El nombre de usuario ya existe', null, 409);
    }
    
    // Crear nuevo usuario
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (user_id, nombre_usuario, password) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$user_id, $username, $hashedPassword]);
    
    sendResponse(true, 'Usuario registrado exitosamente');
    
} catch (PDOException $e) {
    error_log('Error en registro: ' . $e->getMessage());
    if ($e->getCode() == 23000) { // Violación de restricción única
        sendResponse(false, 'El usuario ya existe', null, 409);
    } else {
        sendResponse(false, 'Error interno del servidor', null, 500);
    }
} catch (Exception $e) {
    error_log('Error en registro: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>