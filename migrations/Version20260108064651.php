<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260108064651 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add indexes on personne table for search optimization (nom, email, telephone)';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE INDEX idx_personne_nom ON personne (nom)');
        $this->addSql('CREATE INDEX idx_personne_email ON personne (email)');
        $this->addSql('CREATE INDEX idx_personne_telephone ON personne (telephone)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX idx_personne_nom ON personne');
        $this->addSql('DROP INDEX idx_personne_email ON personne');
        $this->addSql('DROP INDEX idx_personne_telephone ON personne');
    }
}
