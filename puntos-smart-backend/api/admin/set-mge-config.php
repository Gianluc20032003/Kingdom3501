<?php
// admin/set-mge-config.php
// Configurar tipo de tropa MGE (solo admin)

require_once '../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$user = requireAdmin(); // Solo admins

$input = json_decode(file_get_contents('php://input'), true);
$tipoTropa = $input['tipo_tropa'] ?? '';

// Validar tipo de tropa
$tiposValidos = ['arqueria', 'infanteria', 'caballeria', 'liderazgo', 'ingenieros'];
if (!in_array($tipoTropa, $tiposValidos)) {
    sendResponse(false, 'Tipo de tropa inválido', null, 400);
}

try {
    $pdo = getDBConnection();
    
    // Desactivar configuraciones anteriores
    $stmt = $pdo->prepare("UPDATE mge_config SET activo = 0");
    $stmt->execute();
    
    // Crear nueva configuración
    $stmt = $pdo->prepare("
        INSERT INTO mge_config (tipo_tropa, activo) 
        VALUES (?, 1)
    ");
    $stmt->execute([$tipoTropa]);
    
    // Mapear nombres amigables
    $tiposTropa = [
        'arqueria' => 'Arquería',
        'infanteria' => 'Infantería',
        'caballeria' => 'Caballería',
        'liderazgo' => 'Liderazgo',
        'ingenieros' => 'Ingenieros'
    ];
    
    sendResponse(true, "Evento MGE de {$tiposTropa[$tipoTropa]} configurado exitosamente");
    
} catch (Exception $e) {
    error_log('Error configurando MGE: ' . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>