FROM php:8.3-fpm

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libonig-dev \
    libzip-dev \
    libxml2-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libicu-dev

# Installer les extensions PHP nécessaires pour Symfony 6.4
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && \
    docker-php-ext-configure intl && \
    docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl xml gd intl opcache

# Installer Composer 2.x
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configurer le répertoire de travail
WORKDIR /var/www/html

COPY ../ /var/www/html

# Donner les permissions appropriées
RUN chown -R www-data:www-data /var/www/html
