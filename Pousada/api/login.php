<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'method_not_allowed'], 405);

$user = trim((string)($_POST['username'] ?? ''));
$pass = trim((string)($_POST['password'] ?? ''));

if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
  $_SESSION['logged_in'] = true;
  $_SESSION['csrf'] = bin2hex(random_bytes(16));
  json_response(['ok'=>true, 'csrf'=>$_SESSION['csrf']]);
}
json_response(['error'=>'invalid_credentials'], 401);
