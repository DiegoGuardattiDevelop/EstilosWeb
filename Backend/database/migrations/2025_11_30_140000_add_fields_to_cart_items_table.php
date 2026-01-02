<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            if (!Schema::hasColumn('cart_items', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->index()->after('id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }

            if (!Schema::hasColumn('cart_items', 'product_id')) {
                $table->unsignedBigInteger('product_id')->nullable()->index()->after('user_id');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            }

            if (!Schema::hasColumn('cart_items', 'quantity')) {
                $table->integer('quantity')->default(1)->after('product_id');
            }

            if (!Schema::hasColumn('cart_items', 'session_id')) {
                $table->string('session_id')->nullable()->after('quantity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            if (Schema::hasColumn('cart_items', 'product_id')) {
                try {
                    $table->dropForeign(['product_id']);
                } catch (\Exception $e) {
                    // ignore if foreign doesn't exist
                }
                $table->dropColumn('product_id');
            }

            if (Schema::hasColumn('cart_items', 'user_id')) {
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // ignore
                }
                $table->dropColumn('user_id');
            }

            if (Schema::hasColumn('cart_items', 'quantity')) {
                $table->dropColumn('quantity');
            }

            if (Schema::hasColumn('cart_items', 'session_id')) {
                $table->dropColumn('session_id');
            }
        });
    }
};
