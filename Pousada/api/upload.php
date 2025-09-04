<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

global $ALLOWED_MIME;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'method_not_allowed'], 405);

require_login();
require_csrf();

if (empty($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
  json_response(['error'=>'file_required'], 400);
}
$file = $_FILES['image'];
if ($file['size'] > MAX_FILE_SIZE) json_response(['error'=>'file_too_large'], 400);

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
if (!isset($ALLOWED_MIME[$mime])) json_response(['error'=>'invalid_type'], 400);
$ext = $ALLOWED_MIME[$mime];

$title = trim((string)($_POST['title'] ?? ''));
$caption = trim((string)($_POST['caption'] ?? ''));

$orig = sanitize_filename($file['name']);
$uniq = bin2hex(random_bytes(4));
$filename = $uniq . '-' . ($orig ?: ('foto.' . $ext));
if (!preg_match('/\.' . $ext . '$/i', $filename)) $filename .= '.' . $ext;

$target = UPLOAD_DIR . $filename;
if (!move_uploaded_file($file['tmp_name'], $target)) {
  json_response(['error'=>'upload_failed'], 500);
}
@chmod($target, 0664);

// registra no JSON
$items = read_gallery();
$id = bin2hex(random_bytes(8));
$items[] = [
  'id' => $id,
  'filename' => $filename,
  'title' => $title,
  'caption' => $caption,
  'order' => next_order($items),
  'createdAt' => date('c')
];
write_gallery($items);

json_response(['ok'=>true, 'id'=>$id]);
