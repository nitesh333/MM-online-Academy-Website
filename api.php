<?php
/**
 * Professional Academy Backend API - Sub-Category & Feedback Update v19
 * Hardcoded Master Login: mmonlineacademy26@gmail.com / mmacademy
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

error_reporting(E_ALL);
ini_set('display_errors', 0);

$host = "localhost";
$db_name = "mmtestpr_mmtestprep"; 
$username = "mmtestpr_nitesh";     
$password = "mmtestprep123";      

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $conn->exec("set names utf8mb4"); 
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB_CONNECTION_FAILED"]);
    exit;
}

$inputJSON = json_decode(file_get_contents('php://input'), true) ?? [];
$requestData = array_merge($_GET, $_POST, $inputJSON);
$route = $requestData['route'] ?? '';
$id = $requestData['id'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// 1. SYSTEM INITIALIZATION
if ($route === 'initialize_db' || $route === 'db_test') {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)");
        $conn->exec("CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), date VARCHAR(20), content TEXT, type VARCHAR(50), attachmentUrl LONGTEXT, linkedQuizId VARCHAR(50))");
        $conn->exec("CREATE TABLE IF NOT EXISTS categories (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT)");
        $conn->exec("CREATE TABLE IF NOT EXISTS topics (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), categoryId VARCHAR(50))");
        $conn->exec("CREATE TABLE IF NOT EXISTS quizzes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), subCategoryId VARCHAR(50), topicId VARCHAR(50), questions LONGTEXT, videoUrl VARCHAR(255))");
        $conn->exec("CREATE TABLE IF NOT EXISTS notes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), url LONGTEXT, subCategoryId VARCHAR(50), topicId VARCHAR(50), type VARCHAR(20))");
        $conn->exec("CREATE TABLE IF NOT EXISTS feedback (id VARCHAR(50) PRIMARY KEY, quizId VARCHAR(50), quizTitle VARCHAR(255), studentName VARCHAR(100), studentEmail VARCHAR(100), comment TEXT, date VARCHAR(20), isVisible TINYINT(1) DEFAULT 0)");
        
        // Auto-migration for new columns (Safe to run multiple times)
        try { $conn->exec("ALTER TABLE quizzes ADD COLUMN topicId VARCHAR(50)"); } catch(Exception $e) {}
        try { $conn->exec("ALTER TABLE notes ADD COLUMN topicId VARCHAR(50)"); } catch(Exception $e) {}

        $stmt = $conn->prepare("REPLACE INTO admins (id, username, password) VALUES (1, 'mmonlineacademy26@gmail.com', 'mmacademy')");
        $stmt->execute();
        
        echo json_encode(["success" => true, "status" => "Database Verified & Updated"]);
        exit;
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
        exit;
    }
}

// 2. BULK AGGREGATOR
if ($route === 'bulk' && $method === 'GET') {
    $res = [
        'notifications' => $conn->query("SELECT * FROM notifications ORDER BY id DESC")->fetchAll() ?: [],
        'categories' => $conn->query("SELECT * FROM categories")->fetchAll() ?: [],
        'topics' => $conn->query("SELECT * FROM topics")->fetchAll() ?: [],
        'quizzes' => $conn->query("SELECT * FROM quizzes ORDER BY id DESC")->fetchAll() ?: [],
        'notes' => $conn->query("SELECT * FROM notes ORDER BY id DESC")->fetchAll() ?: []
    ];
    // Decode questions for React
    foreach($res['quizzes'] as &$q) { 
        $decoded = json_decode($q['questions'] ?? '[]', true);
        $q['questions'] = is_array($decoded) ? $decoded : [];
    }
    echo json_encode($res);
    exit;
}

// 3. CORE CRUD
$mapping = ['notifications' => 'notifications', 'categories' => 'categories', 'topics' => 'topics', 'quizzes' => 'quizzes', 'notes' => 'notes', 'feedback' => 'feedback', 'login' => 'admins'];
$table = $mapping[$route] ?? null;

if (!$table) {
    echo json_encode(["error" => "INVALID_ROUTE"]);
    exit;
}

try {
    if ($method === 'GET') {
        $stmt = $id ? $conn->prepare("SELECT * FROM $table WHERE id = ?") : $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
        $id ? $stmt->execute([$id]) : $stmt->execute();
        $output = $id ? $stmt->fetch() : $stmt->fetchAll();
        if ($table === 'quizzes') {
            if ($id) { $output['questions'] = json_decode($output['questions'] ?? '[]', true); }
            else { foreach($output as &$r) $r['questions'] = json_decode($r['questions'] ?? '[]', true); }
        }
    } elseif ($method === 'POST') {
        if ($route === 'login') {
            $stmt = $conn->prepare("SELECT * FROM admins WHERE username = ? AND password = ?");
            $stmt->execute([strtolower($requestData['username']), $requestData['password']]);
            $output = $stmt->fetch() ? ["success" => true] : ["success" => false, "error" => "LOGIN_FAILED"];
        } elseif ($table === 'quizzes') {
            $stmt = $conn->prepare("REPLACE INTO quizzes (id, title, subCategoryId, topicId, questions, videoUrl) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$requestData['id'], $requestData['title'], $requestData['subCategoryId'], $requestData['topicId'] ?? '', json_encode($requestData['questions']), $requestData['videoUrl'] ?? '']);
            $output = ["success" => true];
        } elseif ($table === 'notes') {
            $stmt = $conn->prepare("REPLACE INTO notes (id, title, url, subCategoryId, topicId, type) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$requestData['id'], $requestData['title'], $requestData['url'], $requestData['subCategoryId'], $requestData['topicId'] ?? '', $requestData['type']]);
            $output = ["success" => true];
        } else {
            unset($requestData['route']);
            $cols = implode(',', array_keys($requestData));
            $p = implode(',', array_fill(0, count($requestData), '?'));
            $stmt = $conn->prepare("REPLACE INTO $table ($cols) VALUES ($p)");
            $stmt->execute(array_values($requestData));
            $output = ["success" => true];
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        $output = ["success" => true];
    }
    echo json_encode($output);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>