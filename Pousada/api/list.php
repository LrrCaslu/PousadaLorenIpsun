<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

$items = read_gallery();
usort($items, function($a,$b){
  $oa = (int)($a['order'] ?? 0);
  $ob = (int)($b['order'] ?? 0);
  if ($oa === $ob) {
    return strcmp($a['createdAt'] ?? '', $b['createdAt'] ?? '');
  }
  return $oa <=> $ob;
});

// Ajusta URL absoluta
$base = base_url();
foreach ($items as &$it){
  $it['url'] = $base . '/uploads/' . ($it['filename'] ?? '');
}

json_response($items);
