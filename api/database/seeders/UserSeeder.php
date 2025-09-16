<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Jaxongir',
            'telegram' => '@jaxongir', // telegram username
            'password' => Hash::make('N.Jaxongir'), // parol xohlagancha
        ]);

        User::create([
            'name' => 'Nodir',
            'telegram' => '@Nurullayev_Nodir',
            'password' => Hash::make('QWErty123$%^'),
        ]);
    }
}
