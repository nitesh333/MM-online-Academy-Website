<?php
/**
 * Professional Academy Backend API - Comprehensive Category Restoration
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
    
    // Core Schema Management
    $conn->exec("CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)");
    $conn->exec("CREATE TABLE IF NOT EXISTS categories (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT)");
    $conn->exec("CREATE TABLE IF NOT EXISTS topics (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), categoryId VARCHAR(50))");
    $conn->exec("CREATE TABLE IF NOT EXISTS feedback (id VARCHAR(50) PRIMARY KEY, quizId VARCHAR(50), quizTitle VARCHAR(255), studentName VARCHAR(100), studentEmail VARCHAR(100), comment TEXT, date VARCHAR(20), isVisible TINYINT(1) DEFAULT 0)");
    $conn->exec("CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), date VARCHAR(20), content TEXT, type VARCHAR(50), attachmentUrl LONGTEXT, linkedQuizId VARCHAR(50))");
    $conn->exec("CREATE TABLE IF NOT EXISTS quizzes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), subCategoryId VARCHAR(50), topicId VARCHAR(50), orderNumber INT DEFAULT 0, questions LONGTEXT, videoUrl VARCHAR(255))");
    $conn->exec("CREATE TABLE IF NOT EXISTS notes (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255), url LONGTEXT, subCategoryId VARCHAR(50), topicId VARCHAR(50), type VARCHAR(20))");

    function seedDefaults($conn) {
        $defaultCategories = [
            ['lat', 'LAT (Law Admission Test)', 'Complete entry test preparation for 5-year LLB programs.'],
            ['law-gat', 'LAW GAT', 'Graduate Assessment Test for Bar Council registration.'],
            ['llb-s1', 'LLB Semester 1', 'Foundational subjects and legal systems intro.'],
            ['llb-s2', 'LLB Semester 2', 'Constitutional law and advanced sociology.'],
            ['llb-s3', 'LLB Semester 3', 'Criminal law and procedural basics.'],
            ['llb-s4', 'LLB Semester 4', 'Civil laws and specific legal frameworks.'],
            ['llb-s5', 'LLB Semester 5', 'Final year legal tracks and ethics.'],
            ['spsc', 'SPSC', 'Sindh Public Service Commission job test preparation.'],
            ['iba', 'IBA Sukkur', 'Teachers and Magistrate test preparation tracks.'],
            ['mcat', 'MCAT / MDCAT', 'Medical College Admission Test comprehensive resources.'],
            ['ecat', 'ECAT', 'Engineering College Admission Test modules.'],
            ['ielts', 'IELTS / TOEFL', 'English proficiency testing and preparation.']
        ];
        
        $stmt = $conn->prepare("INSERT IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)");
        foreach($defaultCategories as $cat) { $stmt->execute($cat); }
        
        $defaultTopics = [
            ['top_lat_1', 'Personal Statement', 'lat'],
            ['top_lat_2', 'General Knowledge', 'lat'],
            ['top_gat_1', 'Constitution of Pakistan', 'law-gat'],
            ['top_gat_2', 'CPC', 'law-gat'],
            ['top_gat_3', 'CrPC', 'law-gat'],
            ['top_llb_1', 'Sociology', 'llb-s1'],
            ['top_llb_2', 'English', 'llb-s1']
        ];
        $tStmt = $conn->prepare("INSERT IGNORE INTO topics (id, name, categoryId) VALUES (?, ?, ?)");
        foreach($defaultTopics as $top) { $tStmt->execute($top); }

        $conn->prepare("INSERT IGNORE INTO admins (id, username, password) VALUES (1, 'mmonlineacademy26@gmail.com', 'mmacademy')")->execute();
    }

    // Auto-seed if empty
    $catCount = $conn->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    if ($catCount == 0) { seedDefaults($conn); }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB_OFFLINE: " . $e->getMessage()]);
    exit;
}

$inputJSON = json_decode(file_get_contents('php://input'), true) ?? [];
$requestData = array_merge($_GET, $_POST, $inputJSON);
$route = $requestData['route'] ?? '';
$id = $requestData['id'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($route === 'initialize_db') {
    seedDefaults($conn);
    echo json_encode(["success" => true, "status" => "System Restored"]);
    exit;
}

if ($route === 'db_test') {
    echo json_encode(["success" => true, "status" => "Connected"]);
    exit;
}

if ($route === 'bulk' && $method === 'GET') {
    $res = [
        'notifications' => $conn->query("SELECT * FROM notifications ORDER BY id DESC")->fetchAll() ?: [],
        'categories' => $conn->query("SELECT * FROM categories")->fetchAll() ?: [],
        'topics' => $conn->query("SELECT * FROM topics")->fetchAll() ?: [],
        'quizzes' => $conn->query("SELECT * FROM quizzes ORDER BY orderNumber ASC")->fetchAll() ?: [],
        'notes' => $conn->query("SELECT * FROM notes ORDER BY id DESC")->fetchAll() ?: []
    ];
    foreach($res['quizzes'] as &$q) { 
        $q['questions'] = json_decode($q['questions'] ?? '[]', true); 
    }
    echo json_encode($res);
    exit;
}

$mapping = [
    'notifications' => 'notifications', 
    'categories' => 'categories', 
    'topics' => 'topics', 
    'quizzes' => 'quizzes', 
    'notes' => 'notes', 
    'feedback' => 'feedback', 
    'login' => 'admins'
];

$table = $mapping[$route] ?? null;
if (!$table) { echo json_encode(["error" => "Route Missing"]); exit; }

try {
    if ($method === 'GET') {
        $stmt = $id ? $conn->prepare("SELECT * FROM $table WHERE id = ?") : $conn->prepare("SELECT * FROM $table ORDER BY id DESC");
        $id ? $stmt->execute([$id]) : $stmt->execute();
        $output = $id ? $stmt->fetch() : $stmt->fetchAll();
        if ($table === 'quizzes') {
            if ($id && $output) $output['questions'] = json_decode($output['questions'] ?? '[]', true);
            elseif (!$id) foreach($output as &$r) $r['questions'] = json_decode($r['questions'] ?? '[]', true);
        }
    } elseif ($method === 'POST') {
        if ($route === 'login') {
            $stmt = $conn->prepare("SELECT * FROM admins WHERE username = ? AND password = ?");
            $stmt->execute([strtolower($requestData['username']), $requestData['password']]);
            $output = $stmt->fetch() ? ["success" => true] : ["success" => false];
        } else {
            unset($requestData['route'], $requestData['_t']);
            if ($table === 'quizzes') $requestData['questions'] = json_encode($requestData['questions']);
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
    } elseif ($method === 'PUT') {
        unset($requestData['route'], $requestData['_t'], $requestData['id']);
        $set = []; $vals = [];
        foreach($requestData as $k => $v) { $set[] = "$k = ?"; $vals[] = $v; }
        $vals[] = $id;
        $stmt = $conn->prepare("UPDATE $table SET " . implode(', ', $set) . " WHERE id = ?");
        $stmt->execute($vals);
        $output = ["success" => true];
    }
    echo json_encode($output);
} catch (Exception $e) {
    http_response_code(400); echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>