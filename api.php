
<?php
/**
 * Professional Academy Backend API - Plain-Text Auth v6
 * Hardcoded Master Login: mmonlineacademy26@gmail.com / mmacademy
 */

// 1. FORCE HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

// 2. BUFFER & SILENCE
error_reporting(0);
ini_set('display_errors', 0);
ob_start(); 

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// 3. MASTER CONFIG (Plain Text)
$MASTER_U = 'mmonlineacademy26@gmail.com';
$MASTER_P = 'mmacademy';

// 4. DB CONFIG - UPDATE THESE TO MATCH YOUR ACTUAL HOSTING CREDENTIALS
$host = "localhost";
$db_name = "mmtestpr_mmtestprep"; // The database name created in your hosting panel
$username = "mmtestpr_nitesh";     // The database user assigned to that DB
$password = "mmtestprep123";      // The password for that database user

// 5. UNIVERSAL INPUT PARSING
$inputRaw = file_get_contents('php://input');
$inputJSON = json_decode($inputRaw, true) ?? [];
$requestData = array_merge($_GET, $_POST, $inputJSON);

$route = isset($requestData['route']) ? trim($requestData['route']) : '';
$id = isset($requestData['id']) ? trim($requestData['id']) : '';
$method = strtoupper($_SERVER['REQUEST_METHOD']);

// 6. SYSTEM ROUTES (BYPASS DATABASE ENTIRELY)
if ($route === 'db_test') {
    ob_end_clean();
    echo json_encode(["success" => true, "status" => "ONLINE", "message" => "System reachable"]);
    exit;
}

if ($route === 'login') {
    $u = strtolower(trim($requestData['username'] ?? ''));
    $p = trim($requestData['password'] ?? '');
    
    // THE PLAIN-TEXT BYPASS: Direct string comparison
    if ($u === strtolower($MASTER_U) && $p === $MASTER_P) {
        ob_end_clean();
        echo json_encode(["success" => true, "user" => $MASTER_U, "role" => "master"]);
        exit;
    }
}

// 7. DB CONNECTION
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $e) {
    if ($route === 'login') {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Access Denied: Master check failed and Database is offline"]);
        exit;
    }
    ob_end_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DATABASE_OFFLINE", "debug" => $e->getMessage()]);
    exit;
}

// 8. DB INITIALIZATION (Stores Plain Text Password)
if ($route === 'initialize_db') {
    try {
        $queries = [
            "CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)",
            "CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), date VARCHAR(20), content TEXT, type VARCHAR(50), pdfUrl LONGTEXT)",
            "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT)",
            "CREATE TABLE IF NOT EXISTS quizzes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), subCategoryId VARCHAR(50), questions LONGTEXT, videoUrl VARCHAR(255))",
            "CREATE TABLE IF NOT EXISTS notes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), url LONGTEXT, subCategoryId VARCHAR(50), type VARCHAR(20))",
            "CREATE TABLE IF NOT EXISTS feedback (id VARCHAR(50) PRIMARY KEY, quizId VARCHAR(50), quizTitle VARCHAR(255), studentName VARCHAR(100), studentEmail VARCHAR(100), comment TEXT, date VARCHAR(20), isVisible TINYINT(1) DEFAULT 0)"
        ];
        foreach($queries as $q) { $conn->exec($q); }
        
        // Store plain text password for mmacademy
        $stmt = $conn->prepare("REPLACE INTO admins (id, username, password) VALUES (1, ?, ?)");
        $stmt->execute([strtolower($MASTER_U), $MASTER_P]);

        ob_end_clean();
        echo json_encode(["success" => true, "message" => "Institutional Registry Restored."]);
    } catch (Exception $e) {
        ob_end_clean();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// 9. SECONDARY LOGIN (PLAIN-TEXT DB COMPARISON)
if ($route === 'login') {
    $u = strtolower(trim($requestData['username'] ?? ''));
    $p = trim($requestData['password'] ?? '');
    
    $stmt = $conn->prepare("SELECT * FROM admins WHERE LOWER(username) = ? LIMIT 1");
    $stmt->execute([$u]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check using plain text comparison
    if ($user && $p === $user['password']) {
        ob_end_clean();
        echo json_encode(["success" => true, "user" => $user['username']]);
    } else {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Access Denied: Invalid Credentials"]);
    }
    exit;
}

// 10. CRUD OPERATIONS
$tables = ['notifications' => 'notifications', 'categories' => 'categories', 'quizzes' => 'quizzes', 'notes' => 'notes', 'feedback' => 'feedback', 'admins' => 'admins'];
$table = $tables[$route] ?? null;

if (!$table) {
    ob_end_clean();
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "Route Not Found"]);
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
                $output = $res ?: (object)[];
            } else {
                $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
                $stmt->execute();
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if ($table === 'quizzes') {
                    foreach ($rows as &$r) { $r['questions'] = json_decode($r['questions'] ?? '[]'); }
                }
                $output = $rows;
            }
            break;
        case 'POST':
            if ($table === 'quizzes') {
                $stmt = $conn->prepare("REPLACE INTO quizzes (id, title, subCategoryId, questions, videoUrl) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['title'], $requestData['subCategoryId'], json_encode($requestData['questions']), $requestData['videoUrl'] ?? '']);
            } elseif ($table === 'notifications') {
                $stmt = $conn->prepare("REPLACE INTO notifications (id, title, date, content, type, pdfUrl) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['title'], $requestData['date'], $requestData['content'], $requestData['type'], $requestData['pdfUrl'] ?? null]);
            } elseif ($table === 'categories') {
                $stmt = $conn->prepare("REPLACE INTO categories (id, name, description) VALUES (?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['name'], $requestData['description']]);
            } elseif ($table === 'notes') {
                $stmt = $conn->prepare("REPLACE INTO notes (id, title, url, subCategoryId, type) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['title'], $requestData['url'], $requestData['subCategoryId'], $requestData['type']]);
            } elseif ($table === 'admins') {
                $stmt = $conn->prepare("REPLACE INTO admins (username, password) VALUES (?, ?)");
                $stmt->execute([strtolower($requestData['username']), $requestData['password']]);
            } elseif ($table === 'feedback') {
                $stmt = $conn->prepare("REPLACE INTO feedback (id, quizId, quizTitle, studentName, studentEmail, comment, date, isVisible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['quizId'], $requestData['quizTitle'], $requestData['studentName'], $requestData['studentEmail'], $requestData['comment'], $requestData['date'], $requestData['isVisible'] ? 1 : 0]);
            }
            $output = ["success" => true];
            break;
        case 'PUT':
            if ($id && $table === 'feedback') {
                $stmt = $conn->prepare("UPDATE feedback SET isVisible = ? WHERE id = ?");
                $stmt->execute([$requestData['isVisible'] ? 1 : 0, $id]);
                $output = ["success" => true];
            } else {
                $output = ["success" => false, "error" => "PUT only supported for feedback moderation."];
            }
            break;
        case 'DELETE':
            if ($id) {
                $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
                $stmt->execute([$id]);
            }
            $output = ["success" => true];
            break;
    }
    ob_end_clean();
    echo json_encode($output);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
