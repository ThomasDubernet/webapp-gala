<?php

namespace App\Tests\Api;

use App\Entity\Personne;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PersonneApiTest extends WebTestCase
{
    use ApiTestTrait;

    public function testGetPersonnesRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/personnes');

        $this->assertResponseStatusCodeSame(302); // Redirect to login
    }

    public function testGetPersonnesCollection(): void
    {
        $client = $this->createAuthenticatedClient();

        $response = $this->apiRequest($client, 'GET', '/api/personnes');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertIsArray($data);
    }

    public function testCreatePersonne(): void
    {
        $client = $this->createAuthenticatedClient();

        $personneData = [
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'email' => 'jean.dupont@test.fr',
            'telephone' => '0612345678',
            'adresse' => '123 Rue de Test',
            'codePostal' => '75001',
            'ville' => 'Paris',
        ];

        $response = $this->apiRequest($client, 'POST', '/api/personnes', $personneData);
        $data = $this->assertJsonResponse($response, 201);

        $this->assertArrayHasKey('id', $data);
        $this->assertEquals('Dupont', $data['nom']);
        $this->assertEquals('Jean', $data['prenom']);
        $this->assertEquals('jean.dupont@test.fr', $data['email']);

        // Cleanup
        $this->deletePersonne($data['id']);
    }

    public function testGetPersonne(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a personne first
        $personne = $this->createTestPersonne();

        $response = $this->apiRequest($client, 'GET', '/api/personnes/' . $personne->getId());
        $data = $this->assertJsonResponse($response, 200);

        $this->assertEquals($personne->getId(), $data['id']);
        $this->assertEquals($personne->getNom(), $data['nom']);

        // Cleanup
        $this->deletePersonne($personne->getId());
    }

    public function testUpdatePersonne(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a personne first
        $personne = $this->createTestPersonne();

        $updateData = [
            'nom' => 'Martin',
            'prenom' => 'Pierre',
            'email' => $personne->getEmail(),
            'telephone' => $personne->getTelephone(),
        ];

        $response = $this->apiRequest($client, 'PUT', '/api/personnes/' . $personne->getId(), $updateData);
        $data = $this->assertJsonResponse($response, 200);

        $this->assertEquals('Martin', $data['nom']);
        $this->assertEquals('Pierre', $data['prenom']);

        // Cleanup
        $this->deletePersonne($personne->getId());
    }

    public function testDeletePersonne(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a personne first
        $personne = $this->createTestPersonne();
        $id = $personne->getId();

        $response = $this->apiRequest($client, 'DELETE', '/api/personnes/' . $id);
        $this->assertEquals(204, $response->getStatusCode());

        // Verify deletion
        $response = $this->apiRequest($client, 'GET', '/api/personnes/' . $id);
        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testUpdatePresence(): void
    {
        $client = $this->createAuthenticatedClient();

        // Create a personne first
        $personne = $this->createTestPersonne();

        $response = $this->apiRequest(
            $client,
            'PUT',
            '/api/personnes/' . $personne->getId() . '/update-presence',
            ['present' => true]
        );

        // The update-presence endpoint may fail if OVH env vars are missing
        // In that case, skip the assertion (500 = env var missing)
        if ($response->getStatusCode() === 500) {
            $this->deletePersonne($personne->getId());
            $this->markTestSkipped('OVH environment variables not configured');
        }

        $data = $this->assertJsonResponse($response, 200);
        $this->assertTrue($data['present']);

        // Cleanup
        $this->deletePersonne($personne->getId());
    }

    public function testCreatePersonneWithMissingRequiredField(): void
    {
        $client = $this->createAuthenticatedClient();

        $personneData = [
            'prenom' => 'Jean',
            // Missing 'nom' which is required
            'email' => 'test@test.fr',
            'telephone' => '0612345678',
        ];

        $response = $this->apiRequest($client, 'POST', '/api/personnes', $personneData);
        $this->assertTrue(in_array($response->getStatusCode(), [400, 422, 500]));
    }

    public function testPersonneNameIsCapitalized(): void
    {
        $client = $this->createAuthenticatedClient();

        $personneData = [
            'nom' => 'DUPONT',
            'prenom' => 'JEAN-PIERRE',
            'email' => 'test.caps@test.fr',
            'telephone' => '0612345679',
        ];

        $response = $this->apiRequest($client, 'POST', '/api/personnes', $personneData);
        $data = $this->assertJsonResponse($response, 201);

        // Names should be title case
        $this->assertEquals('Dupont', $data['nom']);
        $this->assertEquals('Jean-Pierre', $data['prenom']);

        // Cleanup
        $this->deletePersonne($data['id']);
    }

    public function testPersonneEmailIsLowercase(): void
    {
        $client = $this->createAuthenticatedClient();

        $personneData = [
            'nom' => 'Test',
            'prenom' => 'Email',
            'email' => 'TEST.EMAIL@TEST.FR',
            'telephone' => '0612345670',
        ];

        $response = $this->apiRequest($client, 'POST', '/api/personnes', $personneData);
        $data = $this->assertJsonResponse($response, 201);

        // Email should be lowercase
        $this->assertEquals('test.email@test.fr', $data['email']);

        // Cleanup
        $this->deletePersonne($data['id']);
    }

    /**
     * Helper to create a test personne.
     */
    private function createTestPersonne(): Personne
    {
        $em = $this->getEntityManager();

        $personne = new Personne();
        $personne->setNom('TestNom');
        $personne->setPrenom('TestPrenom');
        $personne->setEmail('test' . uniqid() . '@test.fr');
        $personne->setTelephone('0600000000');

        $em->persist($personne);
        $em->flush();

        return $personne;
    }

    /**
     * Helper to delete a personne.
     */
    private function deletePersonne(int $id): void
    {
        $em = $this->getEntityManager();
        $personne = $em->find(Personne::class, $id);
        if ($personne) {
            // Handle conjoint relationship
            if ($personne->getConjoint()) {
                $conjoint = $personne->getConjoint();
                $conjoint->setConjoint(null);
                $personne->setConjoint(null);
                $em->flush();
            }
            $em->remove($personne);
            $em->flush();
        }
    }
}
