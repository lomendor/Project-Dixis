<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MessageController extends Controller
{
    /**
     * Mark a message as read
     */
    public function markAsRead(Request $request, Message $message): Response|JsonResponse
    {
        $user = $request->user();

        // Ensure user has a producer profile
        if (! $user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }

        // Ensure message is for this producer
        if ($message->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        // Mark as read
        $message->is_read = true;
        $message->save();

        return response()->noContent();
    }

    /**
     * Store a reply to a message
     */
    public function storeReply(Request $request, Message $message): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $user = $request->user();

        // Ensure user has a producer profile
        if (! $user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }

        // Ensure parent message exists and is for this producer
        if ($message->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        // Create the reply
        $reply = Message::create([
            'content' => $request->content,
            'user_id' => $user->id,
            'producer_id' => $user->producer->id,
            'parent_id' => $message->id,
            'is_read' => false,
        ]);

        return response()->json($reply, 201);
    }
}
