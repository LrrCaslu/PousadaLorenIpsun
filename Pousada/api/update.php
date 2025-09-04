<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'method_not_allowed'], 405);
require_login();
require_csrf();

$id = (string)($_POST['id'] ?? '');
if ($id === '') json_response(['error'=>'id_required'], 400);

$title = trim((string)($_POST['title'] ?? ''));
$caption = trim((string)($_POST['caption'] ?? ''));
$order = (int)($_POST['order'] ?? 0);

$items = read_gallery();
$found = false;
foreach ($items as &$it){
  if ($it['id'] === $id){
    $it['title'] = $title;
    $it['caption'] = $caption;
    $it['order'] = $order;
    $found = true;
    break;
  }
}
if (!$found) json_response(['error'=>'not_found'], 404);
write_gallery($items);
json_response(['ok'=>true]);
