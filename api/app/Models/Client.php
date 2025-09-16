<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = ['name','telephone','telegram'];

    public function debtRecords() { return $this->hasMany(DebtRecord::class); }
    public function payments()    { return $this->hasMany(Payment::class); }
}
