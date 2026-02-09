<?php
/**
 * Professional Academy Backend API - News Attachment Support v6
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

// 3. MASTER CONFIG
$MASTER_U = 'mmonlineacademy26@gmail.com';
$MASTER_P = 'mmacademy';

// 4. DB CONFIG
$host = "localhost";
$db_name = "mmtestpr_mmtestprep"; 
$username = "mmtestpr_nitesh";     
$password = "mmtestprep123";      

// 5. UNIVERSAL INPUT PARSING
$inputRaw = file_get_contents('php://input');
$inputJSON = json_decode($inputRaw, true) ?? [];
$requestData = array_merge($_GET, $_POST, $inputJSON);

$route = isset($requestData['route']) ? trim($requestData['route']) : '';
$id = isset($requestData['id']) ? trim($requestData['id']) : '';
$method = strtoupper($_SERVER['REQUEST_METHOD']);

// 6. DB CONNECTION
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DATABASE_OFFLINE", "debug" => $e->getMessage()]);
    exit;
}

// 7. DB INITIALIZATION & AUTO-MIGRATION
if ($route === 'initialize_db' || $route === 'db_test') {
    try {
        $queries = [
            "CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)",
            "CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), date VARCHAR(20), content TEXT, type VARCHAR(50), attachmentUrl LONGTEXT)",
            "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT)",
            "CREATE TABLE IF NOT EXISTS quizzes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), subCategoryId VARCHAR(50), questions LONGTEXT, videoUrl VARCHAR(255))",
            "CREATE TABLE IF NOT EXISTS notes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), url LONGTEXT, subCategoryId VARCHAR(50), type VARCHAR(20))",
            "CREATE TABLE IF NOT EXISTS feedback (id VARCHAR(50) PRIMARY KEY, quizId VARCHAR(50), quizTitle VARCHAR(255), studentName VARCHAR(100), studentEmail VARCHAR(100), comment TEXT, date VARCHAR(20), isVisible TINYINT(1) DEFAULT 0)"
        ];
        foreach($queries as $q) { $conn->exec($q); }
        
        $colCheck = $conn->query("SHOW COLUMNS FROM notifications LIKE 'attachmentUrl'");
        if ($colCheck->rowCount() == 0) {
            $conn->exec("ALTER TABLE notifications ADD COLUMN attachmentUrl LONGTEXT");
        }

        $stmt = $conn->prepare("REPLACE INTO admins (id, username, password) VALUES (1, ?, ?)");
        $stmt->execute([strtolower($MASTER_U), $MASTER_P]);

        if ($route === 'initialize_db') {
            ob_end_clean();
            echo json_encode(["success" => true, "message" => "Database ready for News attachments."]);
            exit;
        }
    } catch (Exception $e) {
        if ($route === 'initialize_db') {
            ob_end_clean();
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
            exit;
        }
    }
}

// 8. CRUD
$tables = ['notifications' => 'notifications', 'categories' => 'categories', 'quizzes' => 'quizzes', 'notes' => 'notes', 'feedback' => 'feedback'];
$table = $tables[$route] ?? null;

if (!$table) {
    if ($route === 'db_test') {
        ob_end_clean();
        echo json_encode(["success" => true, "status" => "Connected"]);
    } else {
        ob_end_clean();
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Route Not Found"]);
    }
    exit;
}

try {
    switch ($method) {
        case 'GET':
            $stmt = $id ? $conn->prepare("SELECT * FROM $table WHERE id = ?") : $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
            $id ? $stmt->execute([$id]) : $stmt->execute();
            $output = $id ? ($stmt->fetch(PDO::FETCH_ASSOC) ?: (object)[]) : $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($table === 'quizzes') {
                if ($id) { if($output->questions) $output->questions = json_decode($output->questions); }
                else { foreach($output as &$r) $r['questions'] = json_decode($r['questions'] ?? '[]'); }
            }
            break;
        case 'POST':
            if ($table === 'notifications') {
                $stmt = $conn->prepare("REPLACE INTO notifications (id, title, date, content, type, attachmentUrl) VALUES (:id, :title, :date, :content, :type, :attachment)");
                $stmt->execute([
                    ':id' => $requestData['id'],
                    ':title' => $requestData['title'],
                    ':date' => $requestData['date'],
                    ':content' => $requestData['content'],
                    ':type' => $requestData['type'],
                    ':attachment' => $requestData['attachmentUrl'] ?? ''
                ]);
            } elseif ($table === 'quizzes') {
                $stmt = $conn->prepare("REPLACE INTO quizzes (id, title, subCategoryId, questions, videoUrl) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['title'], $requestData['subCategoryId'], json_encode($requestData['questions']), $requestData['videoUrl'] ?? '']);
            } else if ($table === 'categories') {
                $stmt = $conn->prepare("REPLACE INTO categories (id, name, description) VALUES (?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['name'], $requestData['description']]);
            } else if ($table === 'notes') {
                $stmt = $conn->prepare("REPLACE INTO notes (id, title, url, subCategoryId, type) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['title'], $requestData['url'], $requestData['subCategoryId'], $requestData['type']]);
            } else if ($table === 'feedback') {
                $stmt = $conn->prepare("REPLACE INTO feedback (id, quizId, quizTitle, studentName, studentEmail, comment, date, isVisible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$requestData['id'], $requestData['quizId'], $requestData['quizTitle'], $requestData['studentName'], $requestData['studentEmail'], $requestData['comment'], $requestData['date'], (int)($requestData['isVisible'] ?? 0)]);
            }
            $output = ["success" => true];
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