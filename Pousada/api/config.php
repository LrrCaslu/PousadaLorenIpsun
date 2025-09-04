<?php
declare(strict_types=1);
session_start();

header('Access-Control-Allow-Origin: same-origin');
header('X-Content-Type-Options: nosniff');

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin'; // 

define('ROOT', dirname(__DIR__));
define('UPLOAD_DIR', ROOT . '/uploads/');
define('DATA_DIR', ROOT . '/data/');
define('GALLERY_JSON', DATA_DIR . 'gallery.json');
const MAX_FILE_SIZE = 5242880; // 5MB
$ALLOWED_MIME = [
  'image/jpeg' => 'jpg',
  'image/png'  => 'png',
  'image/webp' => 'webp'
];

if (!is_dir(UPLOAD_DIR)) @mkdir(UPLOAD_DIR, 0775, true);
if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0775, true);
if (!file_exists(GALLERY_JSON)) @file_put_contents(GALLERY_JSON, json_encode([], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES), LOCK_EX);

function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}

function require_login(): void {
  if (empty($_SESSION['logged_in'])) json_response(['error' => 'unauthorized'], 401);
}

function require_csrf(): void {
  $csrf = $_POST['csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
  if (!$csrf || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], (string)$csrf)) {
    json_response(['error' => 'csrf_invalid'], 403);
  }
}

function base_url(): string {
  $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $path = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
  return $scheme . '://' . $host . preg_replace('#/api$#','',$path);
}
