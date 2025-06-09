<?php
// config/jwt_helper.php
// Helper para manejo de JWT tokens

class JWTHelper {
    
    public static function encode($payload) {
        $header = [
            'typ' => 'JWT',
            'alg' => JWT_ALGORITHM
        ];
        
        $payload['iat'] = time();
        $payload['exp'] = time() + (24 * 60 * 60); // Token válido por 24 horas
        
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, JWT_SECRET, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }
    
    public static function decode($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new Exception('Token inválido');
        }
        
        $header = json_decode(self::base64UrlDecode($parts[0]), true);
        $payload = json_decode(self::base64UrlDecode($parts[1]), true);
        $signature = self::base64UrlDecode($parts[2]);
        
        // Verificar algoritmo
        if (!isset($header['alg']) || $header['alg'] !== JWT_ALGORITHM) {
            throw new Exception('Algoritmo no soportado');
        }
        
        // Verificar firma
        $expectedSignature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception('Firma inválida');
        }
        
        // Verificar expiración
        if (isset($payload['exp']) && time() > $payload['exp']) {
            throw new Exception('Token expirado');
        }
        
        return (object) $payload;
    }
    
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}
?>