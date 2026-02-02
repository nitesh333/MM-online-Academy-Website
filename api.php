<?php
/**
 * Professional Academy Backend API - High Compatibility Version
 */

// 1. Output Buffering
ob_start();

// 2. Ultra-Robust CORS Headers (Sent immediately)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// 3. Error Configuration
error_reporting(E_ALL);
ini_set('display_errors', 0); // Hide errors from output to keep JSON clean

// 4. Database Credentials
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
    echo json_encode([
        "success" => false, 
        "error" => "DB_CONNECTION_ERROR", 
        "message" => "Could not connect to database. Check credentials.",
        "debug" => $e->getMessage()
    ]);
    exit;
}

// 5. Routing
$route = $_GET['route'] ?? '';
$id = $_GET['id'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$inputData = file_get_contents('php://input');
$input = json_decode($inputData, true) ?? [];

// Diagnostic Routes
if ($route === 'ping') {
    ob_end_clean();
    echo json_encode(["success" => true, "status" => "online"]);
    exit;
}

if ($route === 'db_test') {
    ob_end_clean();
    echo json_encode(["success" => true, "status" => "Database connected successfully"]);
    exit;
}

// --- LOGIN LOGIC ---
if ($route === 'login' && $method === 'POST') {
    $user = $input['username'] ?? '';
    $pass = $input['password'] ?? '';
    
    if (empty($user) || empty($pass)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Credentials required"]);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE username = ? LIMIT 1");
        $stmt->execute([$user]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin) {
            $storedPass = $admin['password'];
            $isValid = false;

            // Compatibility check for Bcrypt vs Plain Text
            $info = password_get_info($storedPass);
            if ($info['algo'] !== 0) {
                $isValid = password_verify($pass, $storedPass);
            } else {
                // Migration: Check if user put plain text in DB via SQL
                if ($pass === $storedPass) {
                    $isValid = true;
                    // Upgrade to secure hash immediately
                    $newHash = password_hash($pass, PASSWORD_DEFAULT);
                    $uStmt = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
                    $uStmt->execute([$newHash, $admin['id']]);
                }
            }

            if ($isValid) {
                // Compatible token generation (PHP 5.4+)
                $token = bin2hex(openssl_random_pseudo_bytes(16));
                ob_end_clean();
                echo json_encode([
                    "success" => true, 
                    "token" => $token,
                    "username" => $admin['username']
                ]);
                exit;
            }
        }
        
        ob_end_clean();
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Invalid Access Credentials"]);
    } catch (Exception $e) {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "SERVER_LOGIC_ERROR", "debug" => $e->getMessage()]);
    }
    exit;
}

// Standard CRUD Mapping
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
    echo json_encode(["success" => false, "error" => "Endpoint not found"]);
    exit;
}

// RESTful Actions
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
            }
            // Add other tables as needed...
            
            ob_end_clean();
            echo json_encode(["success" => true]);
            break;

        case 'PUT':
            if ($table === 'admins' && $id) {
                $stmt = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
                $stmt->execute([password_hash($input['password'], PASSWORD_DEFAULT), $id]);
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
