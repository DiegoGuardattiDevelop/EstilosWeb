<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->after('user_id')->nullable()->unique();
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->after('order_number')->default('pending');
            $table->decimal('total_amount', 10, 2)->after('status')->default(0);
            $table->text('shipping_address')->after('total_amount')->nullable();
            $table->text('billing_address')->after('shipping_address')->nullable();
            $table->text('notes')->after('billing_address')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'order_number',
                'status',
                'total_amount',
                'shipping_address',
                'billing_address',
                'notes'
            ]);
        });
    }
};
