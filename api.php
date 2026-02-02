
<?php
/**
 * Professional Academy Backend API - Secure Version
 */

error_reporting(0);
ini_set('display_errors', 0);
ob_start();

// --- CORS HEADERS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = "localhost";
$db_name = "mmtestpr_mmtestprep"; 
$username = "mmtestpr_nitesh";     
$password = "mmtestprep123";      

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(["error" => "Connection failed", "details" => $e->getMessage()]);
    exit;
}

$route = $_GET['route'] ?? '';
$id = $_GET['id'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// --- SECURE LOGIN ROUTE ---
if ($route === 'login' && $method === 'POST') {
    ob_clean();
    $user = $input['username'] ?? '';
    $pass = $input['password'] ?? '';
    
    $stmt = $conn->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->execute([$user]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        $storedPass = $admin['password'];
        $isValid = false;

        // Check if it's already a hash or plain text (Migration Logic)
        if (password_get_info($storedPass)['algo'] !== 0) {
            $isValid = password_verify($pass, $storedPass);
        } else {
            // It's plain text (Initial Setup)
            if ($pass === $storedPass) {
                $isValid = true;
                // Auto-upgrade to Hash
                $newHash = password_hash($pass, PASSWORD_DEFAULT);
                $uStmt = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
                $uStmt->execute([$newHash, $admin['id']]);
            }
        }

        if ($isValid) {
            echo json_encode(["success" => true, "token" => "valid_session_" . bin2hex(random_bytes(16))]);
            exit;
        }
    }
    
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid Credentials"]);
    exit;
}

function getTable($route) {
    $map = [
        'notifications' => 'notifications',
        'categories' => 'categories',
        'quizzes' => 'quizzes',
        'notes' => 'notes',
        'feedback' => 'feedback',
        'admins' => 'admins'
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
            if ($table === 'quizzes' && $row) $row['questions'] = json_decode($row['questions']);
            if ($table === 'feedback' && $row) $row['isVisible'] = (bool)$row['isVisible'];
            if ($table === 'admins' && $row) unset($row['password']); // Safety
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
            if ($table === 'admins') {
                foreach ($rows as &$r) { unset($r['password']); } // Safety
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
        } elseif ($table === 'admins') {
            $stmt = $conn->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
            $hashed = password_hash($input['password'], PASSWORD_DEFAULT);
            $stmt->execute([$input['username'], $hashed]);
        }
        
        $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($table === 'quizzes') {
            foreach ($rows as &$r) { $r['questions'] = json_decode($r['questions'] ?? '[]'); }
        }
        if ($table === 'admins') {
            foreach ($rows as &$r) { unset($r['password']); }
        }
        echo json_encode($rows ?: []);
        break;

    case 'PUT':
        if ($table === 'feedback' && $id) {
            $stmt = $conn->prepare("UPDATE feedback SET isVisible = ? WHERE id = ?");
            $stmt->execute([$input['isVisible'] ? 1 : 0, $id]);
        } elseif ($table === 'admins' && $id) {
            $stmt = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
            $hashed = password_hash($input['password'], PASSWORD_DEFAULT);
            $stmt->execute([$hashed, $id]);
        }
        $stmt = $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($table === 'admins') {
            foreach ($rows as &$r) { unset($r['password']); }
        }
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
        if ($table === 'admins') {
            foreach ($rows as &$r) { unset($r['password']); }
        }
        echo json_encode($rows ?: []);
        break;
}
?>
