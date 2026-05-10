<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        foreach ($roles as $role) {
            if ($user->role === $role || $user->hasRole($role)) {
                return $next($request);
            }
        }

        return response()->json(['error' => 'Unauthorized - insufficient permissions'], 403);
    }
}
