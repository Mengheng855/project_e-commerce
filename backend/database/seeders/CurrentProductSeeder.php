<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecification;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\VariantType;
use Illuminate\Database\Seeder;

class CurrentProductSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'sdfghjkdfghjkl84512@gmail.com'],
            [
                'username' => 'hengg',
                'password' => 'password',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $categories = collect([
            ['name' => 'Computer', 'slug' => 'computer', 'description' => 'sdach computer'],
            ['name' => 'Phone', 'slug' => 'phone', 'description' => null],
            ['name' => 'Tablet', 'slug' => 'tablet', 'description' => 'Tablets for drawing and reading'],
            ['name' => 'Audio', 'slug' => 'audio', 'description' => 'Headphones, earphones, and speakers'],
            ['name' => 'Smartwatch', 'slug' => 'smartwatch', 'description' => 'Wearables and fitness trackers'],
        ])->mapWithKeys(fn (array $category) => [
            $category['slug'] => Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category + [
                    'is_active' => true,
                    'user_id' => $admin->id,
                    'updated_by_id' => $admin->id,
                ]
            ),
        ]);

        $brands = collect([
            ['name' => 'Lenovo', 'slug' => 'lenovo', 'description' => 'ThinkPad, Legion, and productivity computers.', 'website' => 'https://www.lenovo.com'],
            ['name' => 'MSI', 'slug' => 'msi', 'description' => 'add lg', 'website' => 'https://www.msi.com/'],
            ['name' => 'ASUS', 'slug' => 'asus', 'description' => 'Zenbook, ROG, monitors, and PC hardware.', 'website' => 'https://www.asus.com'],
            ['name' => 'Apple', 'slug' => 'apple', 'description' => 'Mac, iPhone, iPad, and Apple accessories.', 'website' => 'https://www.apple.com'],
            ['name' => 'Samsung', 'slug' => 'samsung', 'description' => 'Galaxy phones, tablets, and smartwatches.', 'website' => 'https://www.samsung.com'],
            ['name' => 'Sony', 'slug' => 'sony', 'description' => 'Premium headphones, audio systems, and cameras.', 'website' => 'https://www.sony.com'],
            ['name' => 'Xiaomi', 'slug' => 'xiaomi', 'description' => 'Smart devices, wearables, and smartphones.', 'website' => 'https://www.mi.com'],
        ])->mapWithKeys(fn (array $brand) => [
            $brand['slug'] => Brand::updateOrCreate(
                ['slug' => $brand['slug']],
                $brand + [
                    'is_active' => true,
                    'user_id' => $admin->id,
                    'updated_by_id' => $admin->id,
                ]
            ),
        ]);

        $variantTypes = collect(['RAM', 'Color', 'Storage', 'Connection', 'CPU'])
            ->mapWithKeys(fn (string $name) => [
                $name => VariantType::updateOrCreate(['name' => $name]),
            ]);

        foreach ($this->products() as $productData) {
            $product = Product::updateOrCreate(
                ['slug' => $productData['slug']],
                [
                    'name' => $productData['name'],
                    'description' => $productData['description'],
                    'price' => $productData['price'],
                    'original_price' => $productData['original_price'],
                    'stock' => $productData['stock'],
                    'image' => $this->productImageUrl($productData['image']),
                    'is_active' => $productData['is_active'],
                    'is_featured' => $productData['is_featured'],
                    'category_id' => $categories[$productData['category']]->id,
                    'brand_id' => $brands[$productData['brand']]->id,
                    'user_id' => $admin->id,
                    'updated_by_id' => $admin->id,
                ]
            );

            $product->forceFill([
                'created_at' => $productData['created_at'],
                'updated_at' => $productData['updated_at'],
            ])->saveQuietly();

            ProductImage::where('product_id', $product->id)->delete();
            foreach ($productData['images'] as $index => $image) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $this->productImageUrl($image),
                    'alt_text' => $productData['name'],
                    'is_primary' => $index === 0,
                    'order' => $index,
                    'created_at' => $productData['created_at'],
                ]);
            }

            ProductVariant::where('product_id', $product->id)->delete();
            foreach ($productData['variants'] as $variant) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'variant_type_id' => $variantTypes[$variant['type']]->id,
                    'value' => $variant['value'],
                    'color_hex' => $variant['color_hex'] ?? null,
                    'price_modifier' => $variant['price_modifier'],
                    'stock' => $variant['stock'],
                    'is_active' => $variant['is_active'],
                ]);
            }

            ProductSpecification::where('product_id', $product->id)->delete();
            foreach ($productData['specifications'] as $index => $specification) {
                ProductSpecification::create([
                    'product_id' => $product->id,
                    'key' => $specification['key'],
                    'value' => $specification['value'],
                    'order' => $index,
                ]);
            }
        }
    }

    private function productImageUrl(string $filename): string
    {
        return rtrim((string) config('app.url'), '/') . '/storage/products/' . $filename;
    }

    private function products(): array
    {
        return [
            [
                'name' => 'Lenovo LOQ',
                'slug' => 'lenovo-loq',
                'description' => null,
                'price' => 799,
                'original_price' => 2000,
                'stock' => 50,
                'image' => 'bIrO2WtlMXVJbmQfDIv9ru8YdDrjQM4Tsv3j91fA.jpg',
                'is_active' => true,
                'is_featured' => false,
                'category' => 'computer',
                'brand' => 'lenovo',
                'created_at' => '2026-05-14 05:05:13',
                'updated_at' => '2026-05-14 07:48:34',
                'images' => [
                    'bIrO2WtlMXVJbmQfDIv9ru8YdDrjQM4Tsv3j91fA.jpg',
                    'DgHLS0LlUTMVYOnWwVyKOt9fCmsnEObUQ6fOdq7L.jpg',
                    'J31Von267ecea7kFWLfWNt5e94CwZ5vKFCdLILr8.jpg',
                ],
                'variants' => [
                    ['type' => 'RAM', 'value' => '8GB', 'price_modifier' => 50, 'stock' => 50, 'is_active' => true],
                    ['type' => 'RAM', 'value' => '16GB', 'price_modifier' => 120, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111111', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Silver', 'color_hex' => '#c0c0c0', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'White', 'color_hex' => '#ffffff', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Orange', 'color_hex' => '#f97316', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '512GB', 'price_modifier' => 100, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '1TB', 'price_modifier' => 200, 'stock' => 50, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'CPU', 'value' => 'Intel Core i7 13HX'],
                    ['key' => 'GPU', 'value' => 'RTX 30 50'],
                    ['key' => 'Display', 'value' => '15.6inh'],
                    ['key' => 'Battery', 'value' => '48000MA'],
                    ['key' => 'Camera', 'value' => 'Normal'],
                    ['key' => 'Ports', 'value' => '3'],
                    ['key' => 'Weight', 'value' => '2KG'],
                ],
            ],
            [
                'name' => 'MSI Kantana',
                'slug' => 'msi-kantana',
                'description' => 'the best pc in the world',
                'price' => 849,
                'original_price' => 1000,
                'stock' => 50,
                'image' => 'gpcgAr1nkjCFJcCI3MvKwWot7wXjN0q7Mf8r6wz1.jpg',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'computer',
                'brand' => 'msi',
                'created_at' => '2026-05-14 07:20:28',
                'updated_at' => '2026-05-14 07:44:26',
                'images' => [
                    'gpcgAr1nkjCFJcCI3MvKwWot7wXjN0q7Mf8r6wz1.jpg',
                    'QmKYESgDHSYHwm2E8QIJlLClSfD5KIzDNJVtnDDP.jpg',
                    'IRkYYAbFA5kn96U9HjC4uJ0feX6jgKuXoqFuCQIv.jpg',
                    'HzWrF13rFP6ZxXJBcWFcFMrePiP5Krr98n6EAi7M.jpg',
                ],
                'variants' => [
                    ['type' => 'RAM', 'value' => '8GB', 'price_modifier' => 100, 'stock' => 50, 'is_active' => true],
                    ['type' => 'RAM', 'value' => '16GB', 'price_modifier' => 165, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '512GB', 'price_modifier' => 65, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '1TB', 'price_modifier' => 100, 'stock' => 50, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'CPU', 'value' => 'Intel core i7 G12'],
                    ['key' => 'GPU', 'value' => 'Nvidia RTX 4060'],
                    ['key' => 'Display', 'value' => '15.6inh'],
                    ['key' => 'Battery', 'value' => '1000MA'],
                    ['key' => 'Weight', 'value' => '2KG+'],
                ],
            ],
            [
                'name' => 'MSI Kantana #104',
                'slug' => 'msi-kantana-1',
                'description' => 'the best pc in the world',
                'price' => 849,
                'original_price' => 1000,
                'stock' => 50,
                'image' => 'KbXsu2zp2I9ujqTx2N5Ktz1FunXQL1p1DQzkMhZ5.jpg',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'computer',
                'brand' => 'msi',
                'created_at' => '2026-05-14 07:23:04',
                'updated_at' => '2026-05-14 07:44:26',
                'images' => [
                    'KbXsu2zp2I9ujqTx2N5Ktz1FunXQL1p1DQzkMhZ5.jpg',
                    'Ar93xxtZYZP72p3RSMPI6T18csHEcUES9eLlKwVO.jpg',
                    'rsbgylkpNtqOpqVmHtT7472jow8d0klQD6Nz84wF.jpg',
                    '8KUdewgr1O1stE4zEdiEKNf8SeZcHI2fMppMD7bo.jpg',
                ],
                'variants' => [
                    ['type' => 'RAM', 'value' => '8GB', 'price_modifier' => 50, 'stock' => 50, 'is_active' => true],
                    ['type' => 'RAM', 'value' => '16GB', 'price_modifier' => 50, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '512GB', 'price_modifier' => 50, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '1TB', 'price_modifier' => 100, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111111', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Silver', 'color_hex' => '#c0c0c0', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'White', 'color_hex' => '#ffffff', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Orange', 'color_hex' => '#f97316', 'price_modifier' => 20, 'stock' => 50, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'CPU', 'value' => 'intel core 7 g12'],
                    ['key' => 'GPU', 'value' => 'RTX 4060'],
                    ['key' => 'Display', 'value' => '16inh'],
                    ['key' => 'Weight', 'value' => '2kg+'],
                ],
            ],
            [
                'name' => 'Asus Tuf Gaming F15',
                'slug' => 'asus-tuf-gaming-f15',
                'description' => 'The ASUS TUF Gaming F15 is a popular gaming laptop series from ASUS .It has many versions (2020, 2021, 2022, 2023, etc.), so the specs change depending on the model.',
                'price' => 799,
                'original_price' => 1000,
                'stock' => 200,
                'image' => 'asus_laptop.png',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'computer',
                'brand' => 'asus',
                'created_at' => '2026-05-14 08:18:23',
                'updated_at' => '2026-05-14 08:18:41',
                'images' => [
                    'asus_laptop.png',
                ],
                'variants' => [
                    ['type' => 'Storage', 'value' => '512GB', 'price_modifier' => 50, 'stock' => 0, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '1TB', 'price_modifier' => 100, 'stock' => 0, 'is_active' => true],
                    ['type' => 'CPU', 'value' => 'Intel i5', 'price_modifier' => 100, 'stock' => 10, 'is_active' => true],
                    ['type' => 'CPU', 'value' => 'Intel i7', 'price_modifier' => 200, 'stock' => 20, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111111', 'price_modifier' => 25, 'stock' => 200, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Silver', 'color_hex' => '#c0c0c0', 'price_modifier' => 25, 'stock' => 200, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'White', 'color_hex' => '#ffffff', 'price_modifier' => 25, 'stock' => 200, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Orange', 'color_hex' => '#f97316', 'price_modifier' => 25, 'stock' => 200, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'GPU', 'value' => 'RTX 4060 / 4070 (newer 2023 models)'],
                    ['key' => 'Display', 'value' => '15.6-inch screen'],
                    ['key' => 'Battery', 'value' => '10000MA'],
                    ['key' => 'Weight', 'value' => '2kg'],
                ],
            ],
            [
                'name' => 'IPhone xs Max',
                'slug' => 'iphone-xs-max',
                'description' => null,
                'price' => 200,
                'original_price' => 300,
                'stock' => 89,
                'image' => 'iphone_xs_max.png',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'phone',
                'brand' => 'apple',
                'created_at' => '2026-05-14 08:27:42',
                'updated_at' => '2026-05-14 08:27:42',
                'images' => [
                    'iphone_xs_max.png',
                ],
                'variants' => [
                    ['type' => 'Storage', 'value' => '64GB', 'price_modifier' => 20, 'stock' => 89, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '128GB', 'price_modifier' => 40, 'stock' => 89, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '256GB', 'price_modifier' => 50, 'stock' => 89, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111111', 'price_modifier' => 40, 'stock' => 89, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Silver', 'color_hex' => '#c0c0c0', 'price_modifier' => 50, 'stock' => 89, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'White', 'color_hex' => '#ffffff', 'price_modifier' => 60, 'stock' => 89, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Orange', 'color_hex' => '#f97316', 'price_modifier' => 70, 'stock' => 89, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'Display', 'value' => '6.5-inch'],
                    ['key' => 'Resolution', 'value' => '2688 × 1242'],
                    ['key' => 'Chip', 'value' => 'Apple A12 Bionic'],
                    ['key' => 'RAM', 'value' => '4GB'],
                    ['key' => 'Rear Camera', 'value' => 'Dual 12MP + 12MP'],
                    ['key' => 'Front Camera', 'value' => '7MP'],
                    ['key' => 'Battery', 'value' => '3174 mAh'],
                    ['key' => 'Face ID', 'value' => 'Yes'],
                    ['key' => 'SIM', 'value' => 'Nano SIM + eSIM'],
                    ['key' => 'Charging', 'value' => 'Lightning'],
                    ['key' => 'Lightning', 'value' => 'IP68'],
                    ['key' => 'Weight', 'value' => '208g'],
                ],
            ],
            [
                'name' => 'Samsung Galaxy Tab S9',
                'slug' => 'samsung-galaxy-tab-s9',
                'description' => 'Premium Android tablet with Snapdragon 8 Gen 2 and AMOLED display.',
                'price' => 699,
                'original_price' => 799,
                'stock' => 30,
                'image' => 'rGnxS1aluhwI4ExJBcHg0FTdvG1B4mfonJiFBLNp.jpg',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'tablet',
                'brand' => 'samsung',
                'created_at' => '2026-06-21 14:52:00',
                'updated_at' => '2026-06-21 14:52:00',
                'images' => [
                    'rGnxS1aluhwI4ExJBcHg0FTdvG1B4mfonJiFBLNp.jpg',
                ],
                'variants' => [
                    ['type' => 'Storage', 'value' => '128GB', 'price_modifier' => 0, 'stock' => 15, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '256GB', 'price_modifier' => 100, 'stock' => 15, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Graphite', 'color_hex' => '#2b2b2a', 'price_modifier' => 0, 'stock' => 15, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'Display', 'value' => '11-inch Dynamic AMOLED 2X'],
                    ['key' => 'Processor', 'value' => 'Snapdragon 8 Gen 2'],
                    ['key' => 'RAM', 'value' => '8GB / 12GB'],
                    ['key' => 'Battery', 'value' => '8400 mAh'],
                ],
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'slug' => 'sony-wh-1000xm5',
                'description' => 'Industry-leading noise-canceling wireless headphones.',
                'price' => 349,
                'original_price' => 399,
                'stock' => 50,
                'image' => 'sony_headphones.png',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'audio',
                'brand' => 'sony',
                'created_at' => '2026-06-21 14:52:00',
                'updated_at' => '2026-06-21 14:52:00',
                'images' => [
                    'sony_headphones.png',
                ],
                'variants' => [
                    ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111111', 'price_modifier' => 0, 'stock' => 25, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Silver', 'color_hex' => '#c0c0c0', 'price_modifier' => 0, 'stock' => 25, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'Battery Life', 'value' => 'Up to 30 hours'],
                    ['key' => 'Connection', 'value' => 'Bluetooth 5.2'],
                    ['key' => 'Weight', 'value' => '250g'],
                ],
            ],
            [
                'name' => 'Xiaomi Watch S3',
                'slug' => 'xiaomi-watch-s3',
                'description' => 'Stylish smartwatch with interchangeable bezels and AMOLED display.',
                'price' => 129,
                'original_price' => 149,
                'stock' => 100,
                'image' => 'xiaomi_smartwatch.png',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'smartwatch',
                'brand' => 'xiaomi',
                'created_at' => '2026-06-21 14:52:00',
                'updated_at' => '2026-06-21 14:52:00',
                'images' => [
                    'xiaomi_smartwatch.png',
                ],
                'variants' => [
                    ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111111', 'price_modifier' => 0, 'stock' => 50, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Silver', 'color_hex' => '#c0c0c0', 'price_modifier' => 0, 'stock' => 50, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'Display', 'value' => '1.43-inch AMOLED'],
                    ['key' => 'Battery Life', 'value' => 'Up to 15 days'],
                    ['key' => 'Water Resistance', 'value' => '5ATM'],
                ],
            ],
            [
                'name' => 'iPad Air (M2)',
                'slug' => 'ipad-air-m2',
                'description' => 'Powerful tablet with Apple M2 chip and Liquid Retina display.',
                'price' => 599,
                'original_price' => 699,
                'stock' => 40,
                'image' => 'ipad_air.png',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'tablet',
                'brand' => 'apple',
                'created_at' => '2026-06-21 14:52:00',
                'updated_at' => '2026-06-21 14:52:00',
                'images' => [
                    'ipad_air.png',
                ],
                'variants' => [
                    ['type' => 'Storage', 'value' => '128GB', 'price_modifier' => 0, 'stock' => 20, 'is_active' => true],
                    ['type' => 'Storage', 'value' => '256GB', 'price_modifier' => 100, 'stock' => 20, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Space Gray', 'color_hex' => '#5e5e5f', 'price_modifier' => 0, 'stock' => 20, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'Display', 'value' => '11-inch Liquid Retina'],
                    ['key' => 'Processor', 'value' => 'Apple M2'],
                    ['key' => 'Camera', 'value' => '12MP Wide'],
                ],
            ],
            [
                'name' => 'Samsung Galaxy Watch 6',
                'slug' => 'samsung-galaxy-watch-6',
                'description' => 'Smartwatch with advanced health tracking and LTE connectivity.',
                'price' => 249,
                'original_price' => 299,
                'stock' => 60,
                'image' => 'galaxy_watch.png',
                'is_active' => true,
                'is_featured' => true,
                'category' => 'smartwatch',
                'brand' => 'samsung',
                'created_at' => '2026-06-21 14:52:00',
                'updated_at' => '2026-06-21 14:52:00',
                'images' => [
                    'galaxy_watch.png',
                ],
                'variants' => [
                    ['type' => 'Color', 'value' => 'Graphite', 'color_hex' => '#2b2b2a', 'price_modifier' => 0, 'stock' => 30, 'is_active' => true],
                    ['type' => 'Color', 'value' => 'Gold', 'color_hex' => '#ffd700', 'price_modifier' => 10, 'stock' => 30, 'is_active' => true],
                ],
                'specifications' => [
                    ['key' => 'Display', 'value' => '1.5-inch Super AMOLED'],
                    ['key' => 'Processor', 'value' => 'Exynos W930 Dual-Core'],
                    ['key' => 'Battery', 'value' => '425 mAh'],
                ],
            ],
        ];
    }
}
