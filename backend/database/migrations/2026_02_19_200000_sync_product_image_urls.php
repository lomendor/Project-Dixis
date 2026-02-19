<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Sync products.image_url with the primary image from product_images.
 *
 * Fixes a bug where 7/17 products had a stale image_url (from before
 * the Greek re-seeding) that didn't match their product_images[0].url.
 * This caused different photos on product cards vs detail pages.
 */
return new class extends Migration
{
    public function up(): void
    {
        // For each product that has at least one ProductImage,
        // set image_url to the primary image (is_primary DESC, sort_order ASC).
        DB::statement("
            UPDATE products
            SET image_url = sub.url,
                updated_at = NOW()
            FROM (
                SELECT DISTINCT ON (product_id) product_id, url
                FROM product_images
                ORDER BY product_id, is_primary DESC, sort_order ASC
            ) AS sub
            WHERE products.id = sub.product_id
        ");
    }

    public function down(): void
    {
        // Not reversible — old stale image_url values are lost.
    }
};
