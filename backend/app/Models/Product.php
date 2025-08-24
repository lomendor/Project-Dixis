<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'weight_per_unit',
        'unit',
        'stock',
        'category',
        'is_organic',
        'image_url',
        'status',
        'is_active',
        'producer_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the producer that owns the product.
     */
    public function producer()
    {
        return $this->belongsTo(Producer::class);
    }
}