<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

function read_gallery(): array {
  $json = @file_get_contents(GALLERY_JSON);
  if ($json === false || $json === '') return [];
  $data = json_decode($json, true);
  return is_array($data) ? $data : [];
}

function write_gallery(array $items): void {
  $fp = fopen(GALLERY_JSON, 'c+');
  if (!$fp) json_response(['error'=>'storage_unavailable'], 500);
  if (!flock($fp, LOCK_EX)) { fclose($fp); json_response(['error'=>'lock_failed'], 500); }
  ftruncate($fp, 0);
  fwrite($fp, json_encode($items, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT));
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
}

function next_order(array $items): int {
  $max = 0;
  foreach ($items as $it) { $max = max($max, (int)($it['order'] ?? 0)); }
  return $max + 1;
}

function sanitize_filename(string $name): string {
  $name = strtolower($name);
  $name = preg_replace('/[^a-z0-9\.\-_]+/','-', $name);
  return trim($name, '-');
}
