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
        Schema::create('monthly_profits', function (Blueprint $table) {
            $table->id();
            $table->integer('month');
            $table->decimal('total_revenue', 12);
            $table->decimal('total_expenses', 12);
            $table->decimal('total_debts_added', 12);
            $table->decimal('debt_payments', 12);
            $table->decimal('product_profit', 12);
            $table->decimal('net_profit', 12);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_profits');
    }
};
