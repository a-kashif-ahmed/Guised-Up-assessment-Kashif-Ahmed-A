<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\InteractionController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\SearchController;
use Illuminate\Support\Facades\Route;

// --- Public auth routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Everything below requires a valid Sanctum token ---
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::post('/refresh-token', [AuthController::class, 'refresh']);

    // Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    // Feed
    Route::get('/feed', [FeedController::class, 'index']);
    Route::get('/feed/refresh', [FeedController::class, 'refresh']);
    Route::get('/feed/stats', [FeedController::class, 'stats']);

    // Search
    Route::get('/search', [SearchController::class, 'search']);

    // Interactions
    Route::post('/interactions', [InteractionController::class, 'store']);
});
