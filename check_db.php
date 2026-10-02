<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== آخر 5 وجبات في قاعدة البيانات ===\n";

$foodMenus = App\Models\FoodMenu::latest()->take(5)->get(['id', 'name', 'image', 'created_at']);

foreach ($foodMenus as $menu) {
    echo "ID: {$menu->id}\n";
    echo "الاسم: {$menu->name}\n";
    echo "الصورة: " . ($menu->image ? $menu->image : 'لا توجد صورة') . "\n";
    echo "تاريخ الإنشاء: {$menu->created_at}\n";
    echo "-------------------\n";
}

echo "\n=== إجمالي عدد الوجبات: " . App\Models\FoodMenu::count() . " ===\n";

?>
