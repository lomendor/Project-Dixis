<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Get cart items for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $cartItems = $request->user()->cartItems()
            ->with(['product.categories', 'product.images' => function($query) {
                $query->orderBy('is_primary', 'desc')->orderBy('sort_order');
            }, 'product.producer'])
            ->get();

        return response()->json([
            'cart_items' => $cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'unit' => $item->product->unit,
                        'stock' => $item->product->stock,
                        'is_active' => $item->product->is_active,
                        'categories' => $item->product->categories,
                        'images' => $item->product->images,
                        'producer' => $item->product->producer,
                    ],
                    'subtotal' => number_format($item->quantity * $item->product->price, 2),
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            }),
            'total_items' => $cartItems->sum('quantity'),
            'total_amount' => number_format($cartItems->sum(function ($item) {
                return $item->quantity * $item->product->price;
            }), 2)
        ]);
    }

    /**
     * Add item to cart
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:100'
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is active
        if (!$product->is_active) {
            throw ValidationException::withMessages([
                'product_id' => ['This product is not available for purchase.'],
            ]);
        }

        // Check stock if available (nullable for now)
        if ($product->stock !== null && $request->quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ['Not enough stock available. Only ' . $product->stock . ' items left.'],
            ]);
        }

        // Check if item already exists in cart
        $cartItem = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            // Update quantity
            $newQuantity = $cartItem->quantity + $request->quantity;
            
            // Check stock again for total quantity
            if ($product->stock !== null && $newQuantity > $product->stock) {
                throw ValidationException::withMessages([
                    'quantity' => ['Cannot add ' . $request->quantity . ' more items. You already have ' . $cartItem->quantity . ' in cart. Only ' . $product->stock . ' items available.'],
                ]);
            }
            
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        $cartItem->load(['product.categories', 'product.images', 'product.producer']);

        return response()->json([
            'message' => 'Item added to cart successfully',
            'cart_item' => [
                'id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
                'product' => [
                    'id' => $cartItem->product->id,
                    'name' => $cartItem->product->name,
                    'price' => $cartItem->product->price,
                    'unit' => $cartItem->product->unit,
                    'categories' => $cartItem->product->categories,
                    'images' => $cartItem->product->images,
                    'producer' => $cartItem->product->producer,
                ],
                'subtotal' => number_format($cartItem->quantity * $cartItem->product->price, 2),
                'created_at' => $cartItem->created_at,
                'updated_at' => $cartItem->updated_at,
            ]
        ], 201);
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        // Ensure user owns this cart item
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1|max:100'
        ]);

        // Check stock if available
        if ($cartItem->product->stock !== null && $request->quantity > $cartItem->product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ['Not enough stock available. Only ' . $cartItem->product->stock . ' items left.'],
            ]);
        }

        $cartItem->update(['quantity' => $request->quantity]);
        $cartItem->load(['product.categories', 'product.images', 'product.producer']);

        return response()->json([
            'message' => 'Cart item updated successfully',
            'cart_item' => [
                'id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
                'product' => [
                    'id' => $cartItem->product->id,
                    'name' => $cartItem->product->name,
                    'price' => $cartItem->product->price,
                    'unit' => $cartItem->product->unit,
                    'categories' => $cartItem->product->categories,
                    'images' => $cartItem->product->images,
                    'producer' => $cartItem->product->producer,
                ],
                'subtotal' => number_format($cartItem->quantity * $cartItem->product->price, 2),
                'created_at' => $cartItem->created_at,
                'updated_at' => $cartItem->updated_at,
            ]
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        // Ensure user owns this cart item
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart successfully'
        ]);
    }
}
