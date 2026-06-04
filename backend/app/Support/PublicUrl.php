<?php

namespace App\Support;

class PublicUrl
{
    public static function normalize(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH);

        if (! is_string($path) || ! str_starts_with($path, '/storage/')) {
            return $url;
        }

        return rtrim((string) config('app.url'), '/').$path;
    }
}
