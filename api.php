<?php
/**
 * Professional Academy Backend API - Fixed Schema Version
 */

// 1. SET HEADERS & CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ob_start();

error_reporting(E_ALL);
ini_set('display_errors', 0); 

$host = "localhost";
$db_name = "mmtestpr_mmtestprep"; 
$username = "mmtestpr_nitesh";     
$password = "mmtestprep123";      

// MASTER CREDENTIALS - DEFINED GLOBALLY
$MASTER_U = 'mmonlineacademy26@gmail.com';
$MASTER_P = 'mmacademypak2026';

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

$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true) ?? [];
if (empty($input)) $input = $_POST;

// 1. Connection Test
if ($route === 'db_test') {
    ob_end_clean();
    echo json_encode(["success" => true, "status" => "ONLINE", "database" => $db_name]);
    exit;
}

// 2. Authentication
if ($route === 'login') {
    $u = strtolower(trim($input['username'] ?? $_GET['username'] ?? ''));
    $p = trim($input['password'] ?? $_GET['password'] ?? '');
    
    if ($u === strtolower($MASTER_U) && $p === $MASTER_P) {
        ob_end_clean();
        echo json_encode(["success" => true, "token" => bin2hex(random_bytes(16)), "user" => $MASTER_U]);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE LOWER(username) = ? LIMIT 1");
        $stmt->execute([$u]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user && (password_verify($p, $user['password']) || $p === $user['password'])) {
            ob_end_clean();
            echo json_encode(["success" => true, "token" => bin2hex(random_bytes(16)), "user" => $user['username']]);
            exit;
        }
    } catch (Exception $e) {}

    ob_end_clean();
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid credentials"]);
    exit;
}

// 3. FULL DATABASE INITIALIZATION
if ($route === 'repair_admin' || $route === 'initialize_db') {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)");
        $conn->exec("CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), date VARCHAR(20), content TEXT, type VARCHAR(50))");
        $conn->exec("CREATE TABLE IF NOT EXISTS categories (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT)");
        $conn->exec("CREATE TABLE IF NOT EXISTS quizzes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), subCategoryId VARCHAR(50), questions LONGTEXT, videoUrl VARCHAR(255))");
        $conn->exec("CREATE TABLE IF NOT EXISTS notes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), url LONGTEXT, subCategoryId VARCHAR(50), type VARCHAR(20))");
        $conn->exec("CREATE TABLE IF NOT EXISTS feedback (id VARCHAR(50) PRIMARY KEY, quizId VARCHAR(50), quizTitle VARCHAR(255), studentName VARCHAR(100), studentEmail VARCHAR(100), comment TEXT, date VARCHAR(20), isVisible TINYINT(1) DEFAULT 0)");

        $conn->exec("DELETE FROM admins WHERE username = '$MASTER_U'");
        $stmt = $conn->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
        $stmt->execute([$MASTER_U, password_hash($MASTER_P, PASSWORD_DEFAULT)]);

        ob_end_clean();
        echo json_encode(["success" => true, "message" => "All tables initialized successfully."]);
    } catch (Exception $e) {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "INITIALIZATION_FAILED", "debug" => $e->getMessage()]);
    }
    exit;
}

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
    echo json_encode(["success" => false, "error" => "ROUTE_NOT_FOUND", "route" => $route]);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($table === 'quizzes' && $data) $data['questions'] = json_decode($data['questions']);
                if ($table === 'admins' && $data) unset($data['password']);
                $result = $data ?: (object)[];
            } else {
                $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if ($table === 'quizzes') {
                    foreach ($result as &$r) { $r['questions'] = json_decode($r['questions'] ?? '[]'); }
                }
                if ($table === 'admins') {
                    foreach ($result as &$r) { unset($r['password']); }
                }
            }
            ob_end_clean();
            echo json_encode($result);
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
} catch (PDOException $e) {
    ob_end_clean();
    http_response_code(500);
    if ($e->getCode() == '42S02') {
        echo json_encode(["success" => false, "error" => "TABLE_MISSING", "debug" => "Please go to Account -> System Health and click 'Repair & Initialize Tables'."]);
    } else {
        echo json_encode(["success" => false, "error" => "SQL_ERROR", "debug" => $e->getMessage()]);
    }
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "ENGINE_FAILURE", "debug" => $e->getMessage()]);
}
?>