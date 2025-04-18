FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    libpng-dev \
    libwebp-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd \
        --with-jpeg \
        --with-webp \
        --with-freetype \
    && docker-php-ext-install gd

# Active mod_rewrite
RUN a2enmod rewrite

# Copie ton php.ini perso
COPY ./php.ini /usr/local/etc/php/conf.d/custom.ini

# Travaille dans /var/www/html
WORKDIR /var/www/html
