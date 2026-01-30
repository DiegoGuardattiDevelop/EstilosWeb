<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartAbandonment extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'cart_items',
        'checkout_step',
        'abandoned_at',
        'sent_reminder',
    ];

    protected $casts = [
        'cart_items' => 'array',
        'abandoned_at' => 'datetime',
        'sent_reminder' => 'boolean',
    ];

    /**
     * Obtiene el valor total del carrito abandonado
     */
    public function getCartTotalAttribute(): float
    {
        if (!$this->cart_items || !is_array($this->cart_items)) {
            return 0;
        }

        return array_reduce($this->cart_items, function ($total, $item) {
            return $total + (($item['price'] ?? 0) * ($item['quantity'] ?? 0));
        }, 0);
    }
}
