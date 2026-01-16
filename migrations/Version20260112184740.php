<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260112184740 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove ticket/email feature: drop ticket table, remove unused evenement and personne columns';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ticket DROP FOREIGN KEY FK_97A0ADA3A21BD112');
        $this->addSql('DROP TABLE ticket');
        $this->addSql('ALTER TABLE evenement DROP FOREIGN KEY FK_B26681EA8829C86');
        $this->addSql('DROP INDEX UNIQ_B26681EA8829C86 ON evenement');
        $this->addSql('ALTER TABLE evenement DROP image_ticket_id, DROP nom_salle, DROP date, DROP adresse, DROP code_postal, DROP ville, DROP text_email');
        $this->addSql('ALTER TABLE personne DROP mail_envoye');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE ticket (id INT AUTO_INCREMENT NOT NULL, personne_id INT NOT NULL, fichier VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, numero INT NOT NULL, UNIQUE INDEX UNIQ_97A0ADA3A21BD112 (personne_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_97A0ADA3A21BD112 FOREIGN KEY (personne_id) REFERENCES personne (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE personne ADD mail_envoye TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE evenement ADD image_ticket_id INT DEFAULT NULL, ADD nom_salle VARCHAR(255) DEFAULT NULL, ADD date DATETIME DEFAULT NULL, ADD adresse VARCHAR(255) DEFAULT NULL, ADD code_postal VARCHAR(255) DEFAULT NULL, ADD ville VARCHAR(255) DEFAULT NULL, ADD text_email LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE evenement ADD CONSTRAINT FK_B26681EA8829C86 FOREIGN KEY (image_ticket_id) REFERENCES media_object (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B26681EA8829C86 ON evenement (image_ticket_id)');
    }
}
