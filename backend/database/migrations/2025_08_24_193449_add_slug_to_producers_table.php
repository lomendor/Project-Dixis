<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            // Guard: check if slug column doesn't exist
            if (!Schema::hasColumn('producers', 'slug')) {
                // Add as nullable first
                $table->string('slug')->nullable()->after('name');
            }
        });
        
        // Populate existing rows with slugs
        $producers = DB::table('producers')->whereNull('slug')->get();
        foreach ($producers as $producer) {
            $baseSlug = Str::slug($producer->name);
            $slug = $this->generateUniqueSlug($baseSlug);
            DB::table('producers')->where('id', $producer->id)->update(['slug' => $slug]);
        }
        
        // Now make slug NOT NULL and unique
        Schema::table('producers', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }
    
    private function generateUniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $counter = 1;
        
        while (DB::table('producers')->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            if (Schema::hasColumn('producers', 'slug')) {
                $table->dropColumn('slug');
            }
        });
    }
};
