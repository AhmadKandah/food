<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('dining_tables', function (Blueprint $table) {
            $table->string('code')->unique()->nullable()->after('id');
        });

        // املأ كود لكل صف موجود (T-001, T-002...)
        $rows = DB::table('dining_tables')->orderBy('id')->get();
        $i = 1;
        foreach ($rows as $r) {
            $code = 'T-'.str_pad($i++, 3, '0', STR_PAD_LEFT);
            DB::table('dining_tables')->where('id', $r->id)->update(['code' => $code]);
        }

        // Keep the column nullable at the schema level so this migration does
        // not require doctrine/dbal just to change an existing column. New
        // rows receive a code from DiningTable::booted(), while existing rows
        // were populated above.
    }

    public function down(): void
    {
        Schema::table('dining_tables', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
