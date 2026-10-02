# Test Menu Filters - Debug Guide

## المشكلة
الفلتر لا يعمل بشكل صحيح

## خطوات التشخيص

### 1. تحقق من قاعدة البيانات
```bash
php artisan tinker
```

في Tinker، اكتب:
```php
// تحقق من وجود فئات
App\Models\FoodCategory::all();

// تحقق من وجود طعام
App\Models\FoodMenu::all();

// تحقق من العلاقة
$food = App\Models\FoodMenu::first();
$food->foodCategory;
```

### 2. تحقق من السجلات
```bash
tail -f storage/logs/laravel.log
```

### 3. تحقق من المتصفح
- افتح Developer Tools (F12)
- انتقل إلى Console
- اضغط على أزرار الفلتر
- تحقق من الرسائل

### 4. تحقق من الروت
```bash
php artisan route:list | grep menu
```

### 5. تحقق من الكنترولر
- تأكد من أن `PublicController@menu` يعمل
- تحقق من المتغيرات المرسلة للصفحة

## الحلول المحتملة

1. **لا توجد بيانات في قاعدة البيانات**
   - قم بتشغيل seeders
   - أضف بيانات تجريبية

2. **مشكلة في العلاقات**
   - تحقق من النماذج
   - تحقق من foreign keys

3. **مشكلة في JavaScript**
   - تحقق من Console
   - تأكد من وجود العناصر

4. **مشكلة في النموذج**
   - تحقق من action
   - تحقق من method

## للتشغيل
```bash
# تشغيل seeders
php artisan db:seed --class=FoodCategorySeeder
php artisan db:seed --class=FoodMenuSeeder

# مسح الكاش
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```
