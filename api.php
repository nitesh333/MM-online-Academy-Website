<?php
/**
 * Professional Academy Backend API - Ultra-Stable Version
 */

// 1. SET HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Buffer output to catch accidental echoes
ob_start();

error_reporting(E_ALL);
ini_set('display_errors', 0); 

$host = "localhost";
$db_name = "mmtestpr_mmtestprep"; 
$username = "mmtestpr_nitesh";     
$password = "mmtestprep123";      

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DATABASE_CONNECTION_ERROR", "debug" => $e->getMessage()]);
    exit;
}

$route = isset($_GET['route']) ? trim($_GET['route']) : '';
$id = isset($_GET['id']) ? trim($_GET['id']) : '';
$method = strtoupper($_SERVER['REQUEST_METHOD']);

// ROBUST INPUT HANDLING
$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);

// Fallback to $_POST if JSON is empty/invalid
if (empty($input)) {
    $input = $_POST;
}

/**
 * Helper to generate a safe token
 */
function generateToken() {
    if (function_exists('random_bytes')) {
        return bin2hex(random_bytes(16));
    }
    if (function_exists('openssl_random_pseudo_bytes')) {
        return bin2hex(openssl_random_pseudo_bytes(16));
    }
    return bin2hex(uniqid('', true));
}

// --- LOGIN ROUTE ---
if ($route === 'login') {
    // EMERGENCY FIX: Accept credentials from POST body OR URL parameters
    // This solves the "Method Not Allowed" error caused by server redirects
    $raw_user = (string)($input['username'] ?? $_GET['username'] ?? '');
    $raw_pass = (string)($input['password'] ?? $_GET['password'] ?? '');
    
    // Clean strings
    $user = strtolower(trim($raw_user));
    $pass = trim($raw_pass);
    
    // Master Credentials
    $MASTER_USER = 'mmonlineacademy26@gmail.com';
    $MASTER_PASS = 'mmacademypak2026';

    $isMasterMatch = (strcmp($user, strtolower($MASTER_USER)) === 0 && strcmp($pass, $MASTER_PASS) === 0);

    if ($isMasterMatch) {
        $token = generateToken();
        ob_end_clean();
        echo json_encode([
            "success" => true, 
            "token" => $token, 
            "username" => $MASTER_USER,
            "debug" => "Login successful via " . $method
        ]);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE LOWER(username) = ? LIMIT 1");
        $stmt->execute([$user]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin) {
            $stored = trim($admin['password']);
            $isCorrect = false;

            if (password_verify($pass, $stored)) {
                $isCorrect = true;
            } else if (strcmp($pass, $stored) === 0) {
                $isCorrect = true;
                // Auto-upgrade to hash
                if (!password_get_info($stored)['algo']) {
                    $newHash = password_hash($pass, PASSWORD_DEFAULT);
                    $u = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
                    $u->execute([$newHash, $admin['id']]);
                }
            }

            if ($isCorrect) {
                $token = generateToken();
                ob_end_clean();
                echo json_encode([
                    "success" => true, 
                    "token" => $token, 
                    "username" => $admin['username'],
                    "debug" => "Auth success"
                ]);
                exit;
            }
        }
        
        ob_end_clean();
        http_response_code(401);
        echo json_encode([
            "success" => false, 
            "error" => "Invalid ID or Password",
            "debug" => "Method: $method | ULen: " . strlen($user) . " | PLen: " . strlen($pass)
        ]);
    } catch (Exception $e) {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Internal Login Error", "debug" => $e->getMessage()]);
    }
    exit;
}

// --- UTILITY ROUTES ---
if ($route === 'repair_admin') {
    try {
        $conn->exec("ALTER TABLE admins MODIFY COLUMN password VARCHAR(255) NOT NULL");
        $conn->exec("DELETE FROM admins WHERE username = 'mmonlineacademy26@gmail.com'");
        $stmt = $conn->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
        $stmt->execute(['mmonlineacademy26@gmail.com', password_hash('mmacademypak2026', PASSWORD_DEFAULT)]);
        ob_end_clean();
        echo json_encode(["success" => true, "message" => "Admin credentials reset to master defaults."]);
    } catch (Exception $e) {
        ob_end_clean();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

if ($route === 'db_test') {
    ob_end_clean();
    echo json_encode(["success" => true, "status" => "Database Connected Successfully"]);
    exit;
}

// --- CRUD ENGINE ---
$tables = [
    'notifications' => 'notifications', 
    'categories' => 'categories', 
    'quizzes' => 'quizzes', 
    'notes' => 'notes', 
    'feedback' => 'feedback', 
    'admins' => 'admins'
];

$table = $tables[$route] ?? null;

if (!$table) {
    ob_end_clean();
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "Endpoint not found: " . $route]);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
                $stmt->execute([$id]);
                $res = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($table === 'quizzes' && $res) $res['questions'] = json_decode($res['questions']);
                if ($table === 'admins' && $res) unset($res['password']);
                $data = $res ?: new stdClass();
            } else {
                $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
                $stmt->execute();
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if ($table === 'quizzes') {
                    foreach ($data as &$r) { $r['questions'] = json_decode($r['questions'] ?? '[]'); }
                }
                if ($table === 'admins') {
                    foreach ($data as &$r) { unset($r['password']); }
                }
            }
            ob_end_clean();
            echo json_encode($data);
            break;

        case 'POST':
            if ($table === 'admins') {
                $stmt = $conn->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
                $stmt->execute([$input['username'], password_hash($input['password'], PASSWORD_DEFAULT)]);
            } elseif ($table === 'quizzes') {
                $stmt = $conn->prepare("INSERT INTO quizzes (id, title, subCategoryId, questions, videoUrl) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$input['id'], $input['title'], $input['subCategoryId'], json_encode($input['questions']), $input['videoUrl'] ?? '']);
            } elseif ($table === 'notifications') {
                $stmt = $conn->prepare("INSERT INTO notifications (id, title, date, content, type) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$input['id'], $input['title'], $input['date'], $input['content'], $input['type']]);
            } elseif ($table === 'categories') {
                $stmt = $conn->prepare("INSERT INTO categories (id, name, description) VALUES (?, ?, ?)");
                $stmt->execute([$input['id'], $input['name'], $input['description']]);
            } elseif ($table === 'notes') {
                $stmt = $conn->prepare("INSERT INTO notes (id, title, url, subCategoryId, type) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$input['id'], $input['title'], $input['url'], $input['subCategoryId'], $input['type']]);
            } elseif ($table === 'feedback') {
                $stmt = $conn->prepare("INSERT INTO feedback (id, quizId, quizTitle, studentName, studentEmail, comment, date, isVisible) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
                $stmt->execute([$input['id'], $input['quizId'], $input['quizTitle'], $input['studentName'], $input['studentEmail'], $input['comment'], $input['date']]);
            }
            ob_end_clean();
            echo json_encode(["success" => true]);
            break;

        case 'PUT':
            if ($table === 'admins' && $id) {
                $stmt = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
                $stmt->execute([password_hash($input['password'], PASSWORD_DEFAULT), $id]);
            } elseif ($table === 'feedback' && $id) {
                $stmt = $conn->prepare("UPDATE feedback SET isVisible = ? WHERE id = ?");
                $stmt->execute([$input['isVisible'] ? 1 : 0, $id]);
            }
            ob_end_clean();
            echo json_encode(["success" => true]);
            break;

        case 'DELETE':
            if ($id) {
                $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
                $stmt->execute([$id]);
            }
            ob_end_clean();
            echo json_encode(["success" => true]);
            break;
    }
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "CRUD_ERROR", "debug" => $e->getMessage()]);
}
