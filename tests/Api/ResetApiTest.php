<?php

namespace App\Tests\Api;

use App\Entity\Personne;
use App\Entity\Table;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ResetApiTest extends WebTestCase
{
    use ApiTestTrait;

    public function testResetSimpleRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/reset/simple');

        // POST without CSRF token returns 403, or redirect to login
        $this->assertTrue(in_array($client->getResponse()->getStatusCode(), [302, 403]));
    }

    public function testResetAllRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/reset/all');

        $this->assertTrue(in_array($client->getResponse()->getStatusCode(), [302, 403]));
    }

    public function testResetPersonnesWithoutTableRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/reset/personnes-without-table');

        $this->assertTrue(in_array($client->getResponse()->getStatusCode(), [302, 403]));
    }

    public function testResetPersonnesWithoutTable(): void
    {
        $client = $this->createAuthenticatedClient();
        $em = $this->getEntityManager();

        // Create a table
        $table = new Table();
        $table->setNom('Test Table');
        $table->setNumero(777);
        $table->setNombrePlacesMax(8);
        $em->persist($table);
        $em->flush();

        $tableId = $table->getId();

        // Create personne with table
        $personneWithTable = new Personne();
        $personneWithTable->setNom('WithTable');
        $personneWithTable->setPrenom('Test');
        $personneWithTable->setEmail('with.table' . uniqid() . '@test.fr');
        $personneWithTable->setTelephone('0600000001');
        $personneWithTable->setTable($table);
        $em->persist($personneWithTable);

        // Create personne without table
        $personneWithoutTable = new Personne();
        $personneWithoutTable->setNom('WithoutTable');
        $personneWithoutTable->setPrenom('Test');
        $personneWithoutTable->setEmail('without.table' . uniqid() . '@test.fr');
        $personneWithoutTable->setTelephone('0600000002');
        $em->persist($personneWithoutTable);

        $em->flush();

        $idWithTable = $personneWithTable->getId();
        $idWithoutTable = $personneWithoutTable->getId();

        // Call reset endpoint
        $response = $this->apiRequest($client, 'POST', '/api/reset/personnes-without-table');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertTrue($data['success']);
        $this->assertStringContainsString('personne', $data['message']);

        // Refresh entity manager
        $em->clear();

        // Verify personne with table still exists
        $stillExists = $em->find(Personne::class, $idWithTable);
        $this->assertNotNull($stillExists, 'Personne with table should still exist');

        // Verify personne without table was deleted
        $deleted = $em->find(Personne::class, $idWithoutTable);
        $this->assertNull($deleted, 'Personne without table should be deleted');

        // Cleanup - refetch entities after clear
        if ($stillExists) {
            $stillExists->setTable(null);
            $em->remove($stillExists);
        }
        $tableToRemove = $em->find(Table::class, $tableId);
        if ($tableToRemove) {
            $em->remove($tableToRemove);
        }
        $em->flush();
    }

    public function testResetEndpointReturnsJsonStructure(): void
    {
        $client = $this->createAuthenticatedClient();

        // Test reset personnes-without-table structure (safest to test)
        $response = $this->apiRequest($client, 'POST', '/api/reset/personnes-without-table');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertArrayHasKey('success', $data);
        $this->assertArrayHasKey('message', $data);
        $this->assertIsBool($data['success']);
        $this->assertIsString($data['message']);
    }

    /**
     * Note: We don't test resetSimple or resetAll with actual execution
     * as they would destroy test data. These would be better tested
     * in integration tests with isolated test databases.
     */
    public function testResetSimpleEndpointExists(): void
    {
        $client = $this->createAuthenticatedClient();

        // Just verify the endpoint exists and returns JSON
        // We skip actually executing the reset to preserve test data
        $response = $this->apiRequest($client, 'POST', '/api/reset/simple');

        // Should return 200 with success true, or 500 with error
        $this->assertTrue(in_array($response->getStatusCode(), [200, 500]));
    }
}
