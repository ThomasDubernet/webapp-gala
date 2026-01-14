<?php

namespace App\Tests\Api;

use App\Entity\Table;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class TableApiTest extends WebTestCase
{
    use ApiTestTrait;

    public function testGetTablesRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/tables');

        $this->assertResponseStatusCodeSame(302); // Redirect to login
    }

    public function testGetTablesCollection(): void
    {
        $client = $this->createAuthenticatedClient();

        $response = $this->apiRequest($client, 'GET', '/api/tables');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertIsArray($data);
    }

    public function testCreateTable(): void
    {
        $client = $this->createAuthenticatedClient();

        $tableData = [
            'nom' => 'Table VIP',
            'numero' => 99,
            'nombrePlacesMax' => 10,
            'posX' => '50.00',
            'posY' => '50.00',
        ];

        $response = $this->apiRequest($client, 'POST', '/api/tables', $tableData);
        $data = $this->assertJsonResponse($response, 201);

        $this->assertArrayHasKey('id', $data);
        $this->assertEquals('Table VIP', $data['nom']);
        $this->assertEquals(99, $data['numero']);
        $this->assertEquals(10, $data['nombrePlacesMax']);

        // Cleanup
        $this->deleteTable($data['id']);
    }

    public function testGetTable(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a table first
        $table = $this->createTestTable();

        $response = $this->apiRequest($client, 'GET', '/api/tables/' . $table->getId());
        $data = $this->assertJsonResponse($response, 200);

        $this->assertEquals($table->getId(), $data['id']);
        $this->assertEquals($table->getNumero(), $data['numero']);

        // Cleanup
        $this->deleteTable($table->getId());
    }

    public function testUpdateTable(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a table first
        $table = $this->createTestTable();

        $updateData = [
            'nom' => 'Table Modifiee',
            'numero' => $table->getNumero(),
            'nombrePlacesMax' => 12,
            'posX' => $table->getPosX(),
            'posY' => $table->getPosY(),
        ];

        $response = $this->apiRequest($client, 'PUT', '/api/tables/' . $table->getId(), $updateData);
        $data = $this->assertJsonResponse($response, 200);

        $this->assertEquals('Table Modifiee', $data['nom']);
        $this->assertEquals(12, $data['nombrePlacesMax']);

        // Cleanup
        $this->deleteTable($table->getId());
    }

    public function testDeleteTable(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a table first
        $table = $this->createTestTable();
        $id = $table->getId();

        $response = $this->apiRequest($client, 'DELETE', '/api/tables/' . $id);
        $this->assertEquals(204, $response->getStatusCode());

        // Verify deletion
        $response = $this->apiRequest($client, 'GET', '/api/tables/' . $id);
        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testUpdateTablePosition(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a table first
        $table = $this->createTestTable();

        $updateData = [
            'nom' => $table->getNom(),
            'numero' => $table->getNumero(),
            'nombrePlacesMax' => $table->getNombrePlacesMax(),
            'posX' => '75.50',
            'posY' => '25.25',
        ];

        $response = $this->apiRequest($client, 'PUT', '/api/tables/' . $table->getId(), $updateData);
        $data = $this->assertJsonResponse($response, 200);

        $this->assertEquals('75.50', $data['posX']);
        $this->assertEquals('25.25', $data['posY']);

        // Cleanup
        $this->deleteTable($table->getId());
    }

    public function testCreateTableWithMissingRequiredField(): void
    {
        $client = $this->createAuthenticatedClient();

        $tableData = [
            'nom' => 'Table Incomplete',
            // Missing 'numero' and 'nombrePlacesMax'
        ];

        $response = $this->apiRequest($client, 'POST', '/api/tables', $tableData);
        $this->assertTrue(in_array($response->getStatusCode(), [400, 422, 500]));
    }

    public function testPatchTablePositionOnly(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a table first
        $table = $this->createTestTable();
        $originalNumero = $table->getNumero();
        $originalNom = $table->getNom();

        // PATCH with only position fields (like frontend does for drag & drop)
        $patchData = [
            'posX' => '80.00',
            'posY' => '60.00',
        ];

        $response = $this->apiRequest($client, 'PATCH', '/api/tables/' . $table->getId(), $patchData);
        $data = $this->assertJsonResponse($response, 200);

        // Position should be updated
        $this->assertEquals('80.00', $data['posX']);
        $this->assertEquals('60.00', $data['posY']);

        // Other fields should remain unchanged
        $this->assertEquals($originalNumero, $data['numero']);
        $this->assertEquals($originalNom, $data['nom']);

        // Cleanup
        $this->deleteTable($table->getId());
    }

    public function testGetTableWithPersonnes(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a table
        $table = $this->createTestTable();

        $response = $this->apiRequest($client, 'GET', '/api/tables/' . $table->getId());
        $data = $this->assertJsonResponse($response, 200);

        // Table should include personnes array (even if empty)
        $this->assertArrayHasKey('personnes', $data);
        $this->assertIsArray($data['personnes']);

        // Cleanup
        $this->deleteTable($table->getId());
    }

    /**
     * Helper to create a test table.
     */
    private function createTestTable(): Table
    {
        $em = $this->getEntityManager();

        $table = new Table();
        $table->setNom('Table Test ' . uniqid());
        $table->setNumero(rand(100, 999));
        $table->setNombrePlacesMax(8);
        $table->setPosX('10.00');
        $table->setPosY('10.00');

        $em->persist($table);
        $em->flush();

        return $table;
    }

    /**
     * Helper to delete a table.
     */
    private function deleteTable(int $id): void
    {
        $em = $this->getEntityManager();
        $table = $em->find(Table::class, $id);
        if ($table) {
            // Remove personnes from table first
            foreach ($table->getPersonnes() as $personne) {
                $personne->setTable(null);
            }
            $em->flush();
            $em->remove($table);
            $em->flush();
        }
    }
}
