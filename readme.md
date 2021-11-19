# Starter Symfony 5

Ce projet est un starter avec symfony 5 Il est configuré avec :
- symfony/webpack-encore-bundle
- gitlab-ci
- sass-loader 
- postcss
- autoprefixer

## Environnement de développement
* PHP 7.4
* Composer
* Symfony CLI
* Docker
* Docker-compose
* Node.js
* Yarn ( ou npm )

Vous pouvez vérifier les pré-requis (sauf Docker et Docker-compose) avec la commande suivante (Symfony CLI) :

```bash
symfony check:requirements
```

### Lancer l'environnement de développement

```bash
composer install
yarn install
docker-compose up -d
symfony serve -d
yarn watch
```

Pour servir symfony sur un port personnalisé (ex: 8008) :
```bash
symfony serve --port=8008 -d
```

## Lancer les tests
```bash
php bin/phpunit --testdox
````


By Thomas Dubernet

