<?php

namespace App\Tests\Api;

use App\Entity\Personne;
use App\Entity\Table;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SearchApiTest extends WebTestCase
{
    use ApiTestTrait;

    private array $createdPersonneIds = [];
    private array $createdTableIds = [];

    protected function tearDown(): void
    {
        // Cleanup created entities if client exists
        if ($this->client) {
            $em = $this->getEntityManager();

            foreach ($this->createdPersonneIds as $id) {
                $personne = $em->find(Personne::class, $id);
                if ($personne) {
                    $personne->setTable(null);
                    $em->remove($personne);
                }
            }

            foreach ($this->createdTableIds as $id) {
                $table = $em->find(Table::class, $id);
                if ($table) {
                    $em->remove($table);
                }
            }

            $em->flush();
        }

        $this->createdPersonneIds = [];
        $this->createdTableIds = [];

        parent::tearDown();
    }

    public function testSearchRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/personnes/search');

        $this->assertResponseStatusCodeSame(302); // Redirect to login
    }

    public function testSearchReturnsCorrectStructure(): void
    {
        $client = $this->createAuthenticatedClient();

        $response = $this->apiRequest($client, 'GET', '/api/personnes/search');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertArrayHasKey('items', $data);
        $this->assertArrayHasKey('total', $data);
        $this->assertArrayHasKey('page', $data);
        $this->assertArrayHasKey('limit', $data);
        $this->assertArrayHasKey('pages', $data);
        $this->assertIsArray($data['items']);
    }

    public function testSearchByName(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create test personnes
        $this->createTestPersonne('Dupont', 'Jean');
        $this->createTestPersonne('Martin', 'Pierre');

        $response = $this->apiRequest($client, 'GET', '/api/personnes/search?q=Dupont');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertGreaterThanOrEqual(1, count($data['items']));

        // Check that at least one result matches
        $found = false;
        foreach ($data['items'] as $item) {
            if (stripos($item['nom'], 'Dupont') !== false) {
                $found = true;
                break;
            }
        }
        $this->assertTrue($found, 'Search should find personne with name Dupont');
    }

    public function testSearchByFirstName(): void
    {
        $client = $this->createAuthenticatedClient();

        $this->createTestPersonne('Recherche', 'Unique');

        $response = $this->apiRequest($client, 'GET', '/api/personnes/search?q=Unique');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertGreaterThanOrEqual(1, count($data['items']));
    }

    public function testSearchByEmail(): void
    {
        $client = $this->createAuthenticatedClient();

        $uniqueEmail = 'unique' . uniqid() . '@test.fr';
        $this->createTestPersonne('Email', 'Test', $uniqueEmail);

        $response = $this->apiRequest($client, 'GET', '/api/personnes/search?q=' . urlencode($uniqueEmail));
        $data = $this->assertJsonResponse($response, 200);

        $this->assertGreaterThanOrEqual(1, count($data['items']));
    }

    public function testSearchUnassignedOnly(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a table
        $table = $this->createTestTable();

        // Create personne with table
        $personneWithTable = $this->createTestPersonne('Assigned', 'Person');
        $personneWithTable->setTable($table);
        $this->getEntityManager()->flush();

        // Create personne without table
        $this->createTestPersonne('Unassigned', 'Person');

        $response = $this->apiRequest($client, 'GET', '/api/personnes/search?unassigned=true');
        $data = $this->assertJsonResponse($response, 200);

        // All items should have no table
        foreach ($data['items'] as $item) {
            $this->assertNull($item['table'] ?? null, 'All results should be unassigned');
        }
    }

    public function testSearchPagination(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create multiple personnes
        for ($i = 0; $i < 5; $i++) {
            $this->createTestPersonne('Pagination', 'Test' . $i);
        }

        // Test limit
        $response = $this->apiRequest($client, 'GET', '/api/personnes/search?limit=2');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertLessThanOrEqual(2, count($data['items']));
        $this->assertEquals(2, $data['limit']);
        $this->assertEquals(1, $data['page']);

        // Test page 2
        if ($data['pages'] > 1) {
            $response = $this->apiRequest($client, 'GET', '/api/personnes/search?limit=2&page=2');
            $data2 = $this->assertJsonResponse($response, 200);
            $this->assertEquals(2, $data2['page']);
        }
    }

    public function testSearchLimitMaximum(): void
    {
        $client = $this->createAuthenticatedClient();

        // Request more than max limit (100)
        $response = $this->apiRequest($client, 'GET', '/api/personnes/search?limit=200');
        $data = $this->assertJsonResponse($response, 200);

        // Should be capped at 100
        $this->assertLessThanOrEqual(100, $data['limit']);
    }

    public function testSearchCaseInsensitive(): void
    {
        $client = $this->createAuthenticatedClient();

        $this->createTestPersonne('CaseTest', 'Insensitive');

        // Search lowercase
        $response = $this->apiRequest($client, 'GET', '/api/personnes/search?q=casetest');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertGreaterThanOrEqual(1, count($data['items']));
    }

    /**
     * Helper to create a test personne.
     */
    private function createTestPersonne(string $nom, string $prenom, ?string $email = null): Personne
    {
        $em = $this->getEntityManager();

        $personne = new Personne();
        $personne->setNom($nom);
        $personne->setPrenom($prenom);
        $personne->setEmail($email ?? ($nom . $prenom . uniqid() . '@test.fr'));
        $personne->setTelephone('0600000000');

        $em->persist($personne);
        $em->flush();

        $this->createdPersonneIds[] = $personne->getId();

        return $personne;
    }

    /**
     * Helper to create a test table.
     */
    private function createTestTable(): Table
    {
        $em = $this->getEntityManager();

        $table = new Table();
        $table->setNom('Test Table ' . uniqid());
        $table->setNumero(rand(100, 999));
        $table->setNombrePlacesMax(8);

        $em->persist($table);
        $em->flush();

        $this->createdTableIds[] = $table->getId();

        return $table;
    }
}
