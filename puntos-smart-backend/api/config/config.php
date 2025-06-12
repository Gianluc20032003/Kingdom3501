<?php
// config/config.php
// Configuración principal del backend

// 🎯 CONFIGURACIÓN INTELIGENTE - Detecta local vs producción
$isLocal = (
    $_SERVER['HTTP_HOST'] === 'localhost:8000' ||
    $_SERVER['HTTP_HOST'] === 'localhost' ||
    strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false ||
    strpos($_SERVER['HTTP_HOST'], '.local') !== false
);

// Configuración de base de datos
if ($isLocal) {
    // ⚡ Configuración LOCAL
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'puntos_smart_local');
    define('UPLOAD_DIR', '../../uploads/');
} else {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'u538210678_magomax');
    define('DB_PASS', 'Altruista10');
    define('DB_NAME', 'u538210678_kingdom');
    define('UPLOAD_DIR', '../../uploads/');
}

// Configuración de archivos
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/jpg']);

// Configuración de JWT
define('JWT_SECRET', 'tu_clave_secreta_muy_segura_reino_3501');
define('JWT_ALGORITHM', 'HS256');

// Configuración de compresión de imágenes
define('IMAGE_QUALITY', 75); // Calidad JPEG (0-100)
define('MAX_IMAGE_WIDTH', 1920);
define('MAX_IMAGE_HEIGHT', 1080);

// Headers CORS mejorados
if ($isLocal) {
    // CORS más permisivo para desarrollo local
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Credentials: true');
} else {
    // CORS para producción
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de errores
if ($isLocal) {
    // Mostrar errores en desarrollo
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    // Ocultar errores en producción
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
}

// 📊 LOG de configuración (solo en desarrollo)
if ($isLocal) {
    error_log("🎯 PUNTOS SMART - Configuración LOCAL activada");
    error_log("DB: " . DB_HOST . " -> " . DB_NAME);
}

// Función para conectar a la base de datos
function getDBConnection()
{
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        // Log detallado del error
        error_log("❌ Error DB: " . $e->getMessage());
        error_log("Host: " . DB_HOST . ", DB: " . DB_NAME . ", User: " . DB_USER);

        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos',
            'debug' => defined('DB_HOST') ? 'Host: ' . DB_HOST : 'Config no cargada'
        ]);
        exit();
    }
}

// Función para enviar respuesta JSON
function sendResponse($success = true, $message = '', $data = null, $code = 200)
{
    http_response_code($code);
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// Función para validar JWT
function validateJWT($token)
{
    try {
        require_once 'jwt_helper.php';
        return JWTHelper::decode($token);
    } catch (Exception $e) {
        return false;
    }
}

// Función para obtener el usuario autenticado
function getAuthenticatedUser()
{
    // 🔧 Función mejorada para obtener headers que funciona en todos los servidores
    $headers = [];

    // Método 1: getallheaders() si está disponible
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    } else {
        // Método 2: Fallback manual para servidores que no soportan getallheaders()
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) === 'HTTP_') {
                $header = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $headers[$header] = $value;
            }
        }
    }

    // 🔧 Buscar authorization header de múltiples formas
    $authHeader = '';

    // Método 1: Authorization header estándar
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    }
    // Método 2: authorization con minúscula  
    else if (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    }
    // Método 3: Desde $_SERVER directamente
    else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Método 4: Fallback para Apache
    else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    // 🔍 Debug mejorado
    error_log("🔍 Headers encontrados: " . print_r($headers, true));
    error_log("🔍 Auth header final: '" . $authHeader . "'");

    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        error_log("❌ No se encontró token válido");
        sendResponse(false, 'Token de autorización requerido', null, 401);
    }

    $token = $matches[1];
    error_log("🔍 Token extraído: " . substr($token, 0, 20) . "...");

    $payload = validateJWT($token);

    if (!$payload) {
        error_log("❌ Token inválido");
        sendResponse(false, 'Token inválido o expirado', null, 401);
    }

    error_log("✅ Usuario autenticado: " . $payload->username);
    return $payload;
}

// Función para validar que el usuario sea admin
function requireAdmin()
{
    $user = getAuthenticatedUser();
    if (!$user->es_admin) {
        sendResponse(false, 'Acceso denegado. Se requieren permisos de administrador.', null, 403);
    }
    return $user;
}

// Función para comprimir imágenes
function compressImage($source, $destination, $quality = IMAGE_QUALITY)
{
    $info = getimagesize($source);

    if (!$info) {
        return false;
    }

    $mime = $info['mime'];
    $width = $info[0];
    $height = $info[1];

    // Calcular nuevas dimensiones manteniendo la proporción
    $ratio = min(MAX_IMAGE_WIDTH / $width, MAX_IMAGE_HEIGHT / $height);
    if ($ratio < 1) {
        $newWidth = (int)($width * $ratio);
        $newHeight = (int)($height * $ratio);
    } else {
        $newWidth = $width;
        $newHeight = $height;
    }

    // Crear imagen según el tipo
    switch ($mime) {
        case 'image/jpeg':
            $image = imagecreatefromjpeg($source);
            break;
        case 'image/png':
            $image = imagecreatefrompng($source);
            break;
        case 'image/gif':
            $image = imagecreatefromgif($source);
            break;
        default:
            return false;
    }

    if (!$image) {
        return false;
    }

    // Crear nueva imagen redimensionada
    $newImage = imagecreatetruecolor($newWidth, $newHeight);

    // Preservar transparencia para PNG y GIF
    if ($mime == 'image/png' || $mime == 'image/gif') {
        imagecolortransparent($newImage, imagecolorallocatealpha($newImage, 0, 0, 0, 127));
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
    }

    imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    // Guardar imagen comprimida
    $result = false;
    switch ($mime) {
        case 'image/jpeg':
            $result = imagejpeg($newImage, $destination, $quality);
            break;
        case 'image/png':
            $result = imagepng($newImage, $destination, 9);
            break;
        case 'image/gif':
            $result = imagegif($newImage, $destination);
            break;
    }

    imagedestroy($image);
    imagedestroy($newImage);

    return $result;
}

// Función para subir archivos
function uploadFile($file, $subfolder = '')
{
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al subir el archivo');
    }

    // Validar tipo de archivo
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
        throw new Exception('Tipo de archivo no permitido');
    }

    // Validar tamaño
    if ($file['size'] > MAX_FILE_SIZE) {
        throw new Exception('El archivo es demasiado grande');
    }

    // Crear directorio si no existe
    $uploadPath = UPLOAD_DIR . $subfolder;
    if (!is_dir($uploadPath)) {
        mkdir($uploadPath, 0755, true);
    }

    // Generar nombre único
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $fullPath = $uploadPath . '/' . $filename;

    // Comprimir y guardar imagen
    if (compressImage($file['tmp_name'], $fullPath)) {
        return $subfolder . '/' . $filename;
    } else {
        throw new Exception('Error al procesar la imagen');
    }
}

// Función para obtener la semana actual del año
function getCurrentWeek()
{
    return date('W');
}

// Función para obtener el año actual
function getCurrentYear()
{
    return date('Y');
}

// Función para validar entrada
function validateInput($data, $rules)
{
    $errors = [];

    foreach ($rules as $field => $rule) {
        $value = $data[$field] ?? null;

        if (isset($rule['required']) && $rule['required'] && empty($value)) {
            $errors[$field] = "El campo {$field} es requerido";
            continue;
        }

        if (!empty($value)) {
            if (isset($rule['type'])) {
                switch ($rule['type']) {
                    case 'int':
                        if (!filter_var($value, FILTER_VALIDATE_INT)) {
                            $errors[$field] = "El campo {$field} debe ser un número entero";
                        }
                        break;
                    case 'email':
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[$field] = "El campo {$field} debe ser un email válido";
                        }
                        break;
                    case 'string':
                        if (!is_string($value)) {
                            $errors[$field] = "El campo {$field} debe ser texto";
                        }
                        break;
                }
            }

            if (isset($rule['min_length']) && strlen($value) < $rule['min_length']) {
                $errors[$field] = "El campo {$field} debe tener al menos {$rule['min_length']} caracteres";
            }

            if (isset($rule['max_length']) && strlen($value) > $rule['max_length']) {
                $errors[$field] = "El campo {$field} no puede tener más de {$rule['max_length']} caracteres";
            }

            if (isset($rule['min']) && $value < $rule['min']) {
                $errors[$field] = "El campo {$field} debe ser mayor o igual a {$rule['min']}";
            }

            if (isset($rule['max']) && $value > $rule['max']) {
                $errors[$field] = "El campo {$field} debe ser menor o igual a {$rule['max']}";
            }
        }
    }

    return $errors;
}
