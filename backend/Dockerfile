FROM php:8.3-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libcurl4-openssl-dev \
    libzip-dev \
    && docker-php-ext-install curl pdo pdo_mysql zip

RUN printf "%s\n" \
    "upload_max_filesize=10M" \
    "post_max_size=12M" \
    "memory_limit=256M" \
    "expose_php=Off" \
    "opcache.enable=1" \
    "opcache.enable_cli=1" \
    "opcache.memory_consumption=128" \
    "opcache.interned_strings_buffer=16" \
    "opcache.max_accelerated_files=10000" \
    "opcache.validate_timestamps=0" \
    > /usr/local/etc/php/conf.d/app.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install

RUN chmod +x /var/www/html/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
