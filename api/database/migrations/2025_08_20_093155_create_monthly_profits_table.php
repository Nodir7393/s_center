<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_profits', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('month');
            $table->decimal('total_revenue', 12)->default(0);
            $table->decimal('total_expenses', 12)->default(0);
            $table->decimal('total_debts_added', 12)->default(0);
            $table->decimal('debt_payments', 12)->default(0);
            $table->decimal('product_profit', 12)->nullable();
            $table->decimal('net_profit', 12)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_profits');
    }
};
