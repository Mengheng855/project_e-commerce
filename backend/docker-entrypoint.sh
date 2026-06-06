#!/bin/sh
set -e

if [ "$1" = "php" ] && [ "$2" = "artisan" ] && [ "$3" = "serve" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

exec "$@"
