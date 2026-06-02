<?php

$allowedOrigins = array_filter(array_map('trim', explode(',', env(
    'CORS_ALLOWED_ORIGINS'
))));

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'Accept',
    ],

    'exposed_headers' => [],

    'max_age' => 600,

    'supports_credentials' => false,
];
