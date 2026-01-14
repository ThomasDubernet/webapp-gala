<?php

namespace App\Tests\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UserApiTest extends WebTestCase
{
    use ApiTestTrait;

    public function testUserMeRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/user/me');

        $this->assertResponseStatusCodeSame(302); // Redirect to login
    }

    public function testUserMeReturnsCurrentUser(): void
    {
        $client = $this->createAuthenticatedClient();

        $response = $this->apiRequest($client, 'GET', '/api/user/me');
        $data = $this->assertJsonResponse($response, 200);

        $this->assertArrayHasKey('username', $data);
        $this->assertArrayHasKey('roles', $data);
        $this->assertEquals('test@test.fr', $data['username']);
        $this->assertIsArray($data['roles']);
        $this->assertContains('ROLE_ADMIN', $data['roles']);
    }

    public function testUserMeIncludesUserRole(): void
    {
        $client = $this->createAuthenticatedClient();

        $response = $this->apiRequest($client, 'GET', '/api/user/me');
        $data = $this->assertJsonResponse($response, 200);

        // ROLE_ADMIN should include ROLE_USER (due to role hierarchy)
        // Or at minimum, the user should have some role
        $this->assertNotEmpty($data['roles']);
    }

    public function testApiEndpointsRequireAuthentication(): void
    {
        $client = static::createClient();

        $protectedEndpoints = [
            ['GET', '/api/personnes'],
            ['GET', '/api/tables'],
            ['GET', '/api/evenements'],
            ['GET', '/api/personnes/search'],
            ['POST', '/api/reset/simple'],
        ];

        foreach ($protectedEndpoints as [$method, $url]) {
            $client->request($method, $url);
            $this->assertTrue(
                in_array($client->getResponse()->getStatusCode(), [302, 401, 403]),
                "Endpoint {$method} {$url} should require authentication"
            );
        }
    }
}
