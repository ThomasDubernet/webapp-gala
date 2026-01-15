<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260115104612 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add shape, width, height and rotation columns to table entity for modular table shapes';
    }

    public function up(Schema $schema): void
    {
        // Add new columns with default values for existing tables
        $this->addSql("ALTER TABLE `table` ADD shape VARCHAR(20) NOT NULL DEFAULT 'circle', ADD width NUMERIC(6, 2) NOT NULL DEFAULT '7.76', ADD height NUMERIC(6, 2) NOT NULL DEFAULT '7.76', ADD rotation NUMERIC(5, 2) NOT NULL DEFAULT '0'");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `table` DROP shape, DROP width, DROP height, DROP rotation');
    }
}
