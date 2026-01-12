<?php

namespace App\Tests\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Trait for API functional tests.
 * Provides authentication helpers and common utilities.
 */
trait ApiTestTrait
{
    protected static ?string $xsrfToken = null;
    protected ?\Symfony\Bundle\FrameworkBundle\KernelBrowser $client = null;

    /**
     * Create an authenticated client for API tests.
     */
    protected function createAuthenticatedClient(): \Symfony\Bundle\FrameworkBundle\KernelBrowser
    {
        $this->client = static::createClient();

        // Ensure test user exists (must be called after createClient)
        $this->ensureTestUserExists($this->client);

        // Login via form
        $this->client->request('GET', '/login');
        $this->client->submitForm('Connexion', [
            '_username' => 'test@test.fr',
            '_password' => 'test123',
        ]);

        // Get XSRF token from cookie
        $cookies = $this->client->getCookieJar();
        $xsrfCookie = $cookies->get('XSRF-TOKEN');
        if ($xsrfCookie) {
            self::$xsrfToken = $xsrfCookie->getValue();
        }

        return $this->client;
    }

    /**
     * Ensure test user exists in database.
     */
    protected function ensureTestUserExists(\Symfony\Bundle\FrameworkBundle\KernelBrowser $client): void
    {
        $container = $client->getContainer();
        /** @var EntityManagerInterface $em */
        $em = $container->get('doctrine.orm.entity_manager');
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = $container->get('security.user_password_hasher');

        $userRepo = $em->getRepository(User::class);
        $user = $userRepo->findOneBy(['email' => 'test@test.fr']);

        if (!$user) {
            $user = new User();
            $user->setEmail('test@test.fr');
            $user->setRoles(['ROLE_ADMIN']);
            $user->setPassword($hasher->hashPassword($user, 'test123'));
            $em->persist($user);
            $em->flush();
        }
    }

    /**
     * Get the entity manager from the client container.
     */
    protected function getEntityManager(): EntityManagerInterface
    {
        return $this->client->getContainer()->get('doctrine.orm.entity_manager');
    }

    /**
     * Make an authenticated API request with JSON content.
     */
    protected function apiRequest(
        \Symfony\Bundle\FrameworkBundle\KernelBrowser $client,
        string $method,
        string $url,
        array $data = [],
        array $headers = []
    ): \Symfony\Component\HttpFoundation\Response {
        $defaultHeaders = [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ];

        // Add XSRF token for mutation requests
        if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']) && self::$xsrfToken) {
            $defaultHeaders['HTTP_X_XSRF_TOKEN'] = self::$xsrfToken;
        }

        $headers = array_merge($defaultHeaders, $headers);

        $client->request(
            $method,
            $url,
            [],
            [],
            $headers,
            $data ? json_encode($data) : null
        );

        return $client->getResponse();
    }

    /**
     * Assert JSON response.
     */
    protected function assertJsonResponse(\Symfony\Component\HttpFoundation\Response $response, int $statusCode = 200): array
    {
        $this->assertEquals($statusCode, $response->getStatusCode(), $response->getContent());
        $this->assertJson($response->getContent());

        return json_decode($response->getContent(), true);
    }
}
