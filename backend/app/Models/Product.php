<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'slug',
        'description',
        'price',
        'discount_price',
        'weight_per_unit',
        'unit',
        'stock',
        'category',
        'is_organic',
        'is_seasonal',
        'image_url',
        'status',
        'is_active',
        'producer_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_organic' => 'boolean',
        'is_seasonal' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Model-level title backfill for NOT NULL constraint compliance
     * Automatically sets title from name during product creation/update
     */
    protected static function booted()
    {
        static::creating(function (Product $product) {
            if (empty($product->title) && !empty($product->name)) {
                $product->title = $product->name;
            }
        });

        static::updating(function (Product $product) {
            if (empty($product->title) && !empty($product->name)) {
                $product->title = $product->name;
            }
        });
    }

    /**
     * Get the producer that owns the product.
     */
    public function producer()
    {
        return $this->belongsTo(Producer::class);
    }

    /**
     * Get the categories for the product.
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    /**
     * Get the images for the product.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
