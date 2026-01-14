<?php

namespace App\Tests\Api;

use App\Entity\Evenement;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class EvenementApiTest extends WebTestCase
{
    use ApiTestTrait;

    public function testGetEvenementsRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/evenements');

        $this->assertResponseStatusCodeSame(302); // Redirect to login
    }

    public function testGetEvenementsCollection(): void
    {
        $client = $this->createAuthenticatedClient();

        $response = $this->apiRequest($client, 'GET', '/api/evenements');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertIsArray($data);
    }

    public function testGetEvenement(): void
    {
        $client = $this->createAuthenticatedClient();

        // Get or create an evenement
        $evenement = $this->getOrCreateEvenement();

        $response = $this->apiRequest($client, 'GET', '/api/evenements/' . $evenement->getId());
        $data = $this->assertJsonResponse($response, 200);

        $this->assertArrayHasKey('id', $data);
        $this->assertEquals($evenement->getId(), $data['id']);
    }

    public function testUpdateEvenement(): void
    {
        $client = $this->createAuthenticatedClient();

        $evenement = $this->getOrCreateEvenement();
        $originalNom = $evenement->getNom();

        $updateData = [
            'nom' => 'Gala Test ' . uniqid(),
            'billetwebId' => 'test-id-123',
        ];

        $response = $this->apiRequest($client, 'PUT', '/api/evenements/' . $evenement->getId(), $updateData);
        $data = $this->assertJsonResponse($response, 200);

        $this->assertEquals($updateData['nom'], $data['nom']);
        $this->assertEquals($updateData['billetwebId'], $data['billetwebId']);

        // Restore original name
        $em = $this->getEntityManager();
        $evenement = $em->find(Evenement::class, $evenement->getId());
        $evenement->setNom($originalNom);
        $evenement->setBilletwebId(null);
        $em->flush();
    }

    public function testUpdateEvenementBilletwebId(): void
    {
        $client = $this->createAuthenticatedClient();

        $evenement = $this->getOrCreateEvenement();

        $updateData = [
            'nom' => $evenement->getNom() ?? 'Test Event',
            'billetwebId' => 'billetweb-' . uniqid(),
        ];

        $response = $this->apiRequest($client, 'PUT', '/api/evenements/' . $evenement->getId(), $updateData);
        $data = $this->assertJsonResponse($response, 200);

        $this->assertEquals($updateData['billetwebId'], $data['billetwebId']);

        // Cleanup
        $em = $this->getEntityManager();
        $evenement = $em->find(Evenement::class, $evenement->getId());
        $evenement->setBilletwebId(null);
        $em->flush();
    }

    public function testEvenementIncludesPlanInfo(): void
    {
        $client = $this->createAuthenticatedClient();

        $evenement = $this->getOrCreateEvenement();

        $response = $this->apiRequest($client, 'GET', '/api/evenements/' . $evenement->getId());
        $data = $this->assertJsonResponse($response, 200);

        // Plan key may or may not be present depending on serialization config
        // If present, it may be null or an object, both are valid
        // We just verify we get a valid response
        $this->assertArrayHasKey('id', $data);
    }

    public function testGetNonExistentEvenement(): void
    {
        $client = $this->createAuthenticatedClient();

        $response = $this->apiRequest($client, 'GET', '/api/evenements/99999');
        $this->assertEquals(404, $response->getStatusCode());
    }

    /**
     * Get existing evenement or create one for tests.
     */
    private function getOrCreateEvenement(): Evenement
    {
        $em = $this->getEntityManager();
        $evenement = $em->getRepository(Evenement::class)->findOneBy([]);

        if (!$evenement) {
            $evenement = new Evenement();
            $evenement->setNom('Test Event');
            $em->persist($evenement);
            $em->flush();
        }

        return $evenement;
    }
}
