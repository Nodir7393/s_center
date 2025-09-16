<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DebtRecord extends Model
{
    protected $fillable = ['client_id','amount','description'];

    public function client() { return $this->belongsTo(Client::class); }
}
