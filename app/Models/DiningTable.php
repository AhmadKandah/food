<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Crypt;

class DiningTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_name',
        'isOccupied',
        'code',          // ← جديد
    ];

    protected $casts = [
        'isOccupied' => 'boolean',
    ];

    // لو حاب تستخدم ربط المسار بالكود بدلاً من id
    public function getRouteKeyName(): string
    {
        return 'encrypted_id';
    }
    
    // تشفير معرف الطاولة
    public function getEncryptedIdAttribute(): string
    {
        return Crypt::encryptString($this->id);
    }
    
    // فك تشفير معرف الطاولة
    public static function findByEncryptedId(string $encryptedId): ?self
    {
        try {
            $id = Crypt::decryptString($encryptedId);
            return static::find($id);
        } catch (\Exception $e) {
            return null;
        }
    }

    // يولّد كود تلقائي مثل T-001, T-002 عند الإنشاء
    protected static function booted()
    {
        static::creating(function ($table) {
            if (empty($table->code)) {
                $lastId = static::max('id') ?? 0;
                $next   = $lastId + 1;
                $table->code = 'T-'.str_pad($next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    // رابط الطاولة المشفر (يستخدم في QR والواجهة)
    public function getUrlAttribute(): string
    {
        return route('table.order', ['encryptedId' => $this->encrypted_id]);
    }
    
    // رابط الطاولة القصير (مبسط للباركود)
    public function getShortUrlAttribute(): string
    {
        return route('table.short', ['code' => $this->code]);
    }
    
    // رابط الطاولة البسيط جداً (رقم الطاولة فقط)
    public function getSimpleUrlAttribute(): string
    {
        return route('table.simple', ['tableNumber' => $this->table_name]);
    }

    public function customerOrder() : HasOne
    {
        return $this->hasOne(CustomerOrder::class, 'dining_table_id');
    }

    public function reservation() : HasOne
    {
        return $this->hasOne(Reservation::class, 'dining_table_id');
    }
}
