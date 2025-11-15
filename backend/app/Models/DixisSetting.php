<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DixisSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'array',
    ];
}
