<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'method_not_allowed'], 405);
require_login();
require_csrf();

$id = (string)($_POST['id'] ?? '');
if ($id === '') json_response(['error'=>'id_required'], 400);

$items = read_gallery();
$new = [];
$deleted = false;
$filename = null;

foreach ($items as $it){
  if ($it['id'] === $id){
    $deleted = true;
    $filename = $it['filename'] ?? null;
  } else {
    $new[] = $it;
  }
}
if (!$deleted) json_response(['error'=>'not_found'], 404);
write_gallery($new);

// remove arquivo físico
if ($filename){
  $path = UPLOAD_DIR . $filename;
  if (is_file($path)) @unlink($path);
}

json_response(['ok'=>true]);
