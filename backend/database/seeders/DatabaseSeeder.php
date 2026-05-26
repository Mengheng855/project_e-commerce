<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@tostinh.test'],
            [
                'username' => 'admin',
                'password' => 'password',
                'first_name' => 'TosTinh',
                'last_name' => 'Admin',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@tostinh.test'],
            [
                'username' => 'customer',
                'password' => 'password',
                'first_name' => 'Demo',
                'last_name' => 'Customer',
                'is_admin' => false,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $categories = collect([
            ['name' => 'Computers', 'slug' => 'computers', 'description' => 'Laptops, monitors, and desktop essentials.', 'icon' => 'computer', 'color' => '#0f766e'],
            ['name' => 'Phones', 'slug' => 'phones', 'description' => 'Smartphones and mobile accessories.', 'icon' => 'phone', 'color' => '#0f766e'],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Keyboards, mice, chargers, and setup gear.', 'icon' => 'keyboard', 'color' => '#0f766e'],
        ])->mapWithKeys(fn (array $data) => [
            $data['name'] => Category::updateOrCreate(
                ['name' => $data['name']],
                $data + ['is_active' => true, 'user_id' => $admin->id]
            ),
        ]);

        $brands = collect([
            ['name' => 'NovaTech', 'slug' => 'novatech', 'description' => 'Reliable computers for study and work.', 'website' => 'https://example.com/novatech'],
            ['name' => 'PixelWave', 'slug' => 'pixelwave', 'description' => 'Fast phones with clean daily performance.', 'website' => 'https://example.com/pixelwave'],
            ['name' => 'Aero', 'slug' => 'aero', 'description' => 'Accessories for focused desk setups.', 'website' => 'https://example.com/aero'],
        ])->mapWithKeys(fn (array $data) => [
            $data['name'] => Brand::updateOrCreate(
                ['name' => $data['name']],
                $data + ['is_active' => true, 'user_id' => $admin->id]
            ),
        ]);

        collect([
            [
                'image' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=80',
                'foreground_image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
                'text' => 'Upgrade your daily setup with laptops, phones, and desk essentials.',
                'sort_order' => 0,
            ],
            [
                'image' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1800&q=80',
                'foreground_image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
                'text' => 'Fresh electronics for study, work, gaming, and creative projects.',
                'sort_order' => 1,
            ],
        ])->each(fn (array $data) => Banner::updateOrCreate(
            ['sort_order' => $data['sort_order']],
            $data + ['is_active' => true, 'user_id' => $admin->id]
        ));

        $this->call(CurrentProductSeeder::class);
    }
}
