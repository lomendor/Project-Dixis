<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    /**
     * Mark a message as read
     */
    public function markAsRead(Request $request, Message $message): JsonResponse
    {
        $user = $request->user();
        
        // Ensure user has a producer profile
        if (!$user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }
        
        // Ensure message is for this producer
        if ($message->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'Message not found'], 404);
        }
        
        // Mark as read
        $message->is_read = true;
        $message->save();
        
        return response()->json([
            'id' => $message->id,
            'is_read' => $message->is_read,
            'message' => 'Message marked as read'
        ]);
    }
    
    /**
     * Store a reply to a message
     */
    public function storeReply(Request $request, Message $message): JsonResponse
    {
        $request->validate([
            'body' => 'required|string|max:2000',
        ]);
        
        $user = $request->user();
        
        // Ensure user has a producer profile
        if (!$user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }
        
        // Ensure parent message exists and is for this producer
        if ($message->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'Message not found'], 404);
        }
        
        // Create the reply
        $reply = Message::create([
            'body' => $request->body,
            'user_id' => $user->id,
            'producer_id' => $user->producer->id,
            'parent_id' => $message->id,
            'is_read' => false,
        ]);
        
        return response()->json([
            'id' => $reply->id,
            'body' => $reply->body,
            'parent_id' => $reply->parent_id,
            'is_read' => $reply->is_read,
            'created_at' => $reply->created_at,
        ], 201);
    }
}
