<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

/**
 * CSRF Protection for API endpoints using Double Submit Cookie pattern.
 *
 * How it works:
 * 1. On every response, a CSRF token is set in a readable cookie (XSRF-TOKEN)
 * 2. JavaScript must read this cookie and send it as X-XSRF-TOKEN header on mutations
 * 3. This listener validates that the header matches the token
 */
#[AsEventListener(event: 'kernel.request', method: 'onKernelRequest', priority: 10)]
#[AsEventListener(event: 'kernel.response', method: 'onKernelResponse')]
class CsrfApiListener
{
    private const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
    private const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
    private const CSRF_TOKEN_ID = 'api';

    public function __construct(
        private readonly CsrfTokenManagerInterface $csrfTokenManager
    ) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $path = $request->getPathInfo();

        // Only check CSRF for API mutation requests
        if (!str_starts_with($path, '/api')) {
            return;
        }

        // Only check mutating methods
        $method = $request->getMethod();
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return;
        }

        // Get token from header
        $headerToken = $request->headers->get(self::CSRF_HEADER_NAME);

        if (!$headerToken) {
            throw new AccessDeniedHttpException('Missing CSRF token. Send the XSRF-TOKEN cookie value as X-XSRF-TOKEN header.');
        }

        // Validate the token
        $csrfToken = new CsrfToken(self::CSRF_TOKEN_ID, $headerToken);
        if (!$this->csrfTokenManager->isTokenValid($csrfToken)) {
            throw new AccessDeniedHttpException('Invalid CSRF token.');
        }
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();

        // Generate a new token and set it in a cookie
        // This cookie is readable by JavaScript (not httpOnly)
        $token = $this->csrfTokenManager->getToken(self::CSRF_TOKEN_ID)->getValue();

        $cookie = Cookie::create(self::CSRF_COOKIE_NAME)
            ->withValue($token)
            ->withPath('/')
            ->withSecure(false)  // Set to true in production with HTTPS
            ->withHttpOnly(false)  // Must be false for JS to read it
            ->withSameSite(Cookie::SAMESITE_STRICT);

        $response->headers->setCookie($cookie);
    }
}
