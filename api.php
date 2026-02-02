<?php
/**
 * Professional Academy Backend API - Ultra Stable
 */

// 1. SET HEADERS IMMEDIATELY (Crucial to prevent "Failed to Fetch" CORS issues)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Output Buffering to catch errors
ob_start();

// 3. Error Configuration
error_reporting(E_ALL);
ini_set('display_errors', 0); // Log errors but don't print them to break JSON

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
        "error" => "DATABASE_CONNECTION_ERROR", 
        "message" => "The API could not connect to your database.",
        "debug" => $e->getMessage()
    ]);
    exit;
}

// 4. Routing
$route = $_GET['route'] ?? '';
$id = $_GET['id'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Diagnostic Test
if ($route === 'ping') {
    ob_end_clean();
    echo json_encode(["success" => true, "status" => "online", "database" => "connected"]);
    exit;
}

// --- SECURE LOGIN ROUTE ---
if ($route === 'login' && $method === 'POST') {
    $user = $input['username'] ?? '';
    $pass = $input['password'] ?? '';
    
    if (empty($user) || empty($pass)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Username and password are required"]);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE username = ? LIMIT 1");
        $stmt->execute([$user]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin) {
            $storedPass = $admin['password'];
            $isValid = false;

            // Check if stored string is a Bcrypt hash
            $info = password_get_info($storedPass);
            if ($info['algo'] !== 0) {
                // It's a hash
                $isValid = password_verify($pass, $storedPass);
            } else {
                // It's PLAIN TEXT (Migration Mode)
                if ($pass === $storedPass) {
                    $isValid = true;
                    // Auto-upgrade to secure hash
                    $newHash = password_hash($pass, PASSWORD_DEFAULT);
                    $uStmt = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
                    $uStmt->execute([$newHash, $admin['id']]);
                }
            }

            if ($isValid) {
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
        echo json_encode(["success" => false, "error" => "Access Denied: Invalid Credentials"]);
    } catch (Exception $e) {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "SERVER_LOGIC_ERROR", "debug" => $e->getMessage()]);
    }
    exit;
}

// --- GENERIC CRUD ---
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
