<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_abandonments', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->json('cart_items')->nullable();
            $table->integer('checkout_step')->default(1);
            $table->timestamp('abandoned_at')->nullable();
            $table->boolean('sent_reminder')->default(false);
            $table->timestamps();

            $table->index(['email', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_abandonments');
    }
};
