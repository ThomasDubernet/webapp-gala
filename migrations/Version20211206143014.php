<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211206143014 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE categorie_personne (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE categorie_table (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, couleur VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE evenement (id INT AUTO_INCREMENT NOT NULL, plan_id INT DEFAULT NULL, image_ticket_id INT DEFAULT NULL, nom VARCHAR(255) DEFAULT NULL, nom_salle VARCHAR(255) DEFAULT NULL, date DATETIME DEFAULT NULL, adresse VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_B26681EE899029B (plan_id), UNIQUE INDEX UNIQ_B26681EA8829C86 (image_ticket_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE media_object (id INT AUTO_INCREMENT NOT NULL, file_path VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE personne (id INT AUTO_INCREMENT NOT NULL, categorie_id INT DEFAULT NULL, table_id INT DEFAULT NULL, conjoint_id INT DEFAULT NULL, nom VARCHAR(255) NOT NULL, prenom VARCHAR(255) NOT NULL, adresse VARCHAR(255) NOT NULL, telephone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, montant_billet NUMERIC(6, 2) DEFAULT NULL, montant_paye NUMERIC(6, 2) DEFAULT NULL, date_reglement DATETIME DEFAULT NULL, moyen_paiement VARCHAR(255) DEFAULT NULL, commentaire LONGTEXT DEFAULT NULL, INDEX IDX_FCEC9EFBCF5E72D (categorie_id), INDEX IDX_FCEC9EFECFF285C (table_id), UNIQUE INDEX UNIQ_FCEC9EF5E8D7836 (conjoint_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `table` (id INT AUTO_INCREMENT NOT NULL, categorie_id INT DEFAULT NULL, nom VARCHAR(255) NOT NULL, numero INT NOT NULL, nombre_places_max INT NOT NULL, pos_x INT DEFAULT NULL, pos_y INT DEFAULT NULL, INDEX IDX_F6298F46BCF5E72D (categorie_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE evenement ADD CONSTRAINT FK_B26681EE899029B FOREIGN KEY (plan_id) REFERENCES media_object (id)');
        $this->addSql('ALTER TABLE evenement ADD CONSTRAINT FK_B26681EA8829C86 FOREIGN KEY (image_ticket_id) REFERENCES media_object (id)');
        $this->addSql('ALTER TABLE personne ADD CONSTRAINT FK_FCEC9EFBCF5E72D FOREIGN KEY (categorie_id) REFERENCES categorie_personne (id)');
        $this->addSql('ALTER TABLE personne ADD CONSTRAINT FK_FCEC9EFECFF285C FOREIGN KEY (table_id) REFERENCES `table` (id)');
        $this->addSql('ALTER TABLE personne ADD CONSTRAINT FK_FCEC9EF5E8D7836 FOREIGN KEY (conjoint_id) REFERENCES personne (id)');
        $this->addSql('ALTER TABLE `table` ADD CONSTRAINT FK_F6298F46BCF5E72D FOREIGN KEY (categorie_id) REFERENCES categorie_table (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE personne DROP FOREIGN KEY FK_FCEC9EFBCF5E72D');
        $this->addSql('ALTER TABLE `table` DROP FOREIGN KEY FK_F6298F46BCF5E72D');
        $this->addSql('ALTER TABLE evenement DROP FOREIGN KEY FK_B26681EE899029B');
        $this->addSql('ALTER TABLE evenement DROP FOREIGN KEY FK_B26681EA8829C86');
        $this->addSql('ALTER TABLE personne DROP FOREIGN KEY FK_FCEC9EF5E8D7836');
        $this->addSql('ALTER TABLE personne DROP FOREIGN KEY FK_FCEC9EFECFF285C');
        $this->addSql('DROP TABLE categorie_personne');
        $this->addSql('DROP TABLE categorie_table');
        $this->addSql('DROP TABLE evenement');
        $this->addSql('DROP TABLE media_object');
        $this->addSql('DROP TABLE personne');
        $this->addSql('DROP TABLE `table`');
        $this->addSql('DROP TABLE user');
    }
}
