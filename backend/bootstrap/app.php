<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust nginx proxy for X-Forwarded-* headers (HTTPS detection)
        $middleware->trustProxies(at: '*');

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // API routes should return JSON 401, not redirect to login
        $middleware->redirectGuestsTo(fn () => null);

        // Exempt auth endpoints from CSRF — frontend uses Bearer tokens
        // (localStorage), making session CSRF redundant for login/register.
        // Fixes production 419 where nginx routes /sanctum/csrf-cookie
        // to Next.js instead of Laravel.
        $middleware->validateCsrfTokens(except: [
            'api/v1/auth/*',
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'auth.optional' => \App\Http\Middleware\OptionalSanctumAuth::class,
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Return JSON 401 for unauthenticated API requests instead of redirect
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'unauthenticated',
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        // T2.5-04: Consistent JSON error responses for API routes
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                $model = class_basename($e->getModel());
                return response()->json([
                    'error' => 'not_found',
                    'message' => "{$model} not found.",
                ], 404);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'forbidden',
                    'message' => 'Forbidden.',
                ], 403);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'not_found',
                    'message' => 'Route not found.',
                ], 404);
            }
        });
    })->create();
