<?php
/**
 * Professional Academy Backend API
 * 
 * --- RESOLVING "ACCESS DENIED" (ERROR 1044) ---
 * Based on your screenshots, I have updated the credentials below.
 * 
 * IMPORTANT NEXT STEP IN CPANEL:
 * 1. Go to 'MySQL Databases' in cPanel.
 * 2. Scroll to 'Add User To Database'.
 * 3. Select User: mmtestpr_nitesh
 * 4. Select Database: mmtestpr_mmtestprep
 * 5. Click 'ADD'.
 * 6. ON THE NEXT SCREEN, check the box 'ALL PRIVILEGES' and click 'Make Changes'.
 * 
 * Without step 6, the code cannot read or write to the database.
 */

// Prevent stray output/warnings from breaking CORS or JSON
error_reporting(0);
ini_set('display_errors', 0);
ob_start();

// --- CORS HEADERS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================================================
// DATABASE CONFIGURATION (Updated from Screenshots)
// ============================================================
$host = "localhost";
$db_name = "mmtestpr_mmtestprep"; 
$username = "mmtestpr_nitesh";     
$password = "mmtestprep123";      
// ============================================================

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $e) {
    ob_clean();
    http_response_code(500);
    
    $msg = $e->getMessage();
    
    echo json_encode([
        "error" => "Connection failed", 
        "details" => $msg,
        "action_required" => "The user 'mmtestpr_nitesh' exists but does NOT have permissions for 'mmtestpr_mmtestprep'. Go back to cPanel -> MySQL Databases -> 'Add User To Database' section. Click 'Add', then check 'ALL PRIVILEGES' on the next screen."
    ]);
    exit;
}

$route = $_GET['route'] ?? '';
$id = $_GET['id'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

function getTable($route) {
    $map = [
        'notifications' => 'notifications',
        'categories' => 'categories',
        'quizzes' => 'quizzes',
        'notes' => 'notes',
        'feedback' => 'feedback'
    ];
    return $map[$route] ?? null;
}

$table = getTable($route);

if (!$table) {
    ob_clean();
    http_response_code(400);
    echo json_encode(["error" => "Invalid route: " . $route]);
    exit;
}

ob_clean();

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($table === 'quizzes' && $row) {
                $row['questions'] = json_decode($row['questions']);
            }
            if ($table === 'feedback' && $row) {
                $row['isVisible'] = (bool)$row['isVisible'];
            }
            echo json_encode($row ?: new stdClass());
        } else {
            $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($table === 'quizzes') {
                foreach ($rows as &$r) { $r['questions'] = json_decode($r['questions'] ?? '[]'); }
            }
            if ($table === 'feedback') {
                foreach ($rows as &$r) { $r['isVisible'] = (bool)$r['isVisible']; }
            }
            echo json_encode($rows ?: []);
        }
        break;

    case 'POST':
        if ($table === 'quizzes') {
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
            $stmt = $conn->prepare("INSERT INTO feedback (id, quizId, quizTitle, studentName, studentEmail, comment, date, isVisible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$input['id'], $input['quizId'], $input['quizTitle'], $input['studentName'], $input['studentEmail'], $input['comment'], $input['date'], 0]);
        }
        
        $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($table === 'quizzes') {
            foreach ($rows as &$r) { $r['questions'] = json_decode($r['questions'] ?? '[]'); }
        }
        echo json_encode($rows ?: []);
        break;

    case 'PUT':
        if ($table === 'feedback' && $id) {
            $stmt = $conn->prepare("UPDATE feedback SET isVisible = ? WHERE id = ?");
            $stmt->execute([$input['isVisible'] ? 1 : 0, $id]);
        }
        $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) { $r['isVisible'] = (bool)$r['isVisible']; }
        echo json_encode($rows ?: []);
        break;

    case 'DELETE':
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$id]);
        }
        $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($table === 'quizzes') {
            foreach ($rows as &$r) { $r['questions'] = json_decode($r['questions'] ?? '[]'); }
        }
        echo json_encode($rows ?: []);
        break;
}
?>