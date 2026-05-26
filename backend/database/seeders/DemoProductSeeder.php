<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\VariantType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoProductSeeder extends Seeder
{
    public function run(): void
    {
        // Demo catalog seeding is disabled. Add real products from the admin dashboard.
        return;
    }

    private function imageSetFor(string $kind, string $slug): array
    {
        $topic = $this->imageTopicFor($kind, $slug);
        $lock = abs(crc32($slug)) % 90000;

        return [
            "https://loremflickr.com/1200/900/{$topic}?lock=" . ($lock + 1),
            "https://loremflickr.com/1200/900/{$topic}?lock=" . ($lock + 2),
            "https://loremflickr.com/1200/900/{$topic}?lock=" . ($lock + 3),
        ];
    }

    private function imageTopicFor(string $kind, string $slug): string
    {
        if (str_contains($slug, 'monitor') || str_contains($slug, 'odyssey') || str_contains($slug, 'ultragear') || str_contains($slug, 'ultrasharp')) {
            return 'computer-monitor';
        }

        if (str_contains($slug, 'imac') || str_contains($slug, 'optiplex') || str_contains($slug, 'legion-tower')) {
            return 'desktop-computer';
        }

        if (str_contains($slug, 'ipad') || str_contains($slug, 'tab')) {
            return 'tablet-computer';
        }

        if ($kind === 'computer') {
            return 'laptop-computer';
        }

        if ($kind === 'phone') {
            return 'smartphone';
        }

        if (str_contains($slug, 'keyboard') || str_contains($slug, 'keys') || str_contains($slug, 'blackwidow')) {
            return 'computer-keyboard';
        }

        if (str_contains($slug, 'mouse') || str_contains($slug, 'master') || str_contains($slug, 'deathadder')) {
            return 'computer-mouse';
        }

        if (str_contains($slug, 'airpods') || str_contains($slug, 'buds') || str_contains($slug, 'headphone') || str_contains($slug, 'wh-1000xm5')) {
            return 'headphones';
        }

        if (str_contains($slug, 'charger') || str_contains($slug, 'magsafe')) {
            return 'phone-charger';
        }

        if (str_contains($slug, 'cable')) {
            return 'usb-cable';
        }

        if (str_contains($slug, 'hub')) {
            return 'usb-c-hub';
        }

        if (str_contains($slug, 'router') || str_contains($slug, 'archer')) {
            return 'wifi-router';
        }

        if (str_contains($slug, 'webcam') || str_contains($slug, 'c920')) {
            return 'webcam';
        }

        if (str_contains($slug, 'microphone') || str_contains($slug, 'yeti')) {
            return 'microphone';
        }

        if (str_contains($slug, 'speaker') || str_contains($slug, 'flip-6')) {
            return 'speaker';
        }

        if (str_contains($slug, 'power-bank')) {
            return 'power-bank';
        }

        return 'tech-accessory';
    }

    private function specificationsFor(string $kind): array
    {
        return match ($kind) {
            'computer' => [
                ['Processor', 'Intel Core i5 / Ryzen 5 class'],
                ['Memory', '8GB to 32GB options'],
                ['Storage', '512GB SSD or higher'],
                ['Warranty', '1 year official warranty'],
            ],
            'phone' => [
                ['Display', '6.1 inch to 6.8 inch OLED class'],
                ['Camera', 'Dual or triple camera system'],
                ['Battery', 'All-day battery life'],
                ['Charging', 'Fast USB-C charging'],
            ],
            default => [
                ['Connectivity', 'Wireless or USB-C depending on model'],
                ['Compatibility', 'Works with phones, tablets, and computers'],
                ['Warranty', '1 year official warranty'],
                ['Use case', 'Office, study, gaming, and daily setup'],
            ],
        };
    }

    private function variantsFor(string $kind, int $stock): array
    {
        return match ($kind) {
            'computer' => [
                ['type' => 'RAM', 'value' => '8GB', 'price_modifier' => 0],
                ['type' => 'RAM', 'value' => '16GB', 'price_modifier' => 80],
                ['type' => 'RAM', 'value' => '32GB', 'price_modifier' => 180],
                ['type' => 'Storage', 'value' => '512GB', 'price_modifier' => 0],
                ['type' => 'Storage', 'value' => '1TB', 'price_modifier' => 120],
                ['type' => 'Color', 'value' => 'Graphite', 'color_hex' => '#374151', 'price_modifier' => 0],
            ],
            'phone' => [
                ['type' => 'Storage', 'value' => '128GB', 'price_modifier' => 0],
                ['type' => 'Storage', 'value' => '256GB', 'price_modifier' => 100],
                ['type' => 'Storage', 'value' => '512GB', 'price_modifier' => 220],
                ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111827', 'price_modifier' => 0],
                ['type' => 'Color', 'value' => 'Blue', 'color_hex' => '#2563eb', 'price_modifier' => 0],
                ['type' => 'Color', 'value' => 'Orange', 'color_hex' => '#f97316', 'price_modifier' => 20],
            ],
            default => [
                ['type' => 'Color', 'value' => 'Black', 'color_hex' => '#111827', 'price_modifier' => 0],
                ['type' => 'Color', 'value' => 'White', 'color_hex' => '#f8fafc', 'price_modifier' => 0],
                ['type' => 'Connection', 'value' => 'Wireless', 'price_modifier' => 10],
                ['type' => 'Connection', 'value' => 'USB-C', 'price_modifier' => 0],
            ],
        };
    }
}
