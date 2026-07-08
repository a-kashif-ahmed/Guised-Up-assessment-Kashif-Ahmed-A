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

            'name' => 'John Doe',

            'email' => 'john@example.com',

            'password' => Hash::make('password')

        ]);

        User::create([

            'name' => 'Jane Smith',

            'email' => 'jane@example.com',

            'password' => Hash::make('password')

        ]);

        User::factory(18)->create();
    }
}