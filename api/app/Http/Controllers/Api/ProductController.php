<?php

namespace App\Http\Controllers\Api;

use App\Enums\CategoryProduct;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductService $service) {}

    public function index()  { return $this->service->all()->map(fn(Product $p) => [
        'id'             => (string)$p->id, // front string sifatida ishlatyapti
        'name'           => $p->name,
        'category'       => $p->category,   // int bo‘lsa ham frontda mapping qilib ko‘rsatadi yoki label yuborish ham mumkin
        'purchase_price' => $p->purchase_price,
        'sale_price'     => $p->sale_price,
        'stock_quantity' => $p->stock_quantity,
        'min_quantity'   => $p->min_quantity,
        'created_at'     => $p->created_at?->toISOString(),
        'updated_at'     => $p->updated_at?->toISOString(),
    ]); }

    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255',
            'category' => 'required', // |integer|min:0|max:255
            'purchase_price' => 'required|numeric',
            'sale_price' => 'required|numeric',
            'stock_quantity' => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
        ]);
        // category normalizatsiya (string ham kelsa intga o‘giradi)
        $data['category'] = CategoryProduct::parse($data['category']);

        return $this->service->create($data);
    }

    public function update(Request $r, Product $product)
    {
        $data = $r->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes', // |integer|min:0|max:255
            'purchase_price' => 'sometimes|numeric',
            'sale_price' => 'sometimes|numeric',
            'stock_quantity' => 'sometimes|integer|min:0',
            'min_quantity' => 'sometimes|integer|min:0',
        ]);

        if (array_key_exists('category', $data)) {
            $data['category'] = CategoryProduct::parse($data['category']);
        }

        return $this->service->update($product, $data);
    }

    public function destroy(Product $product)
    {
        $this->service->delete($product);
        return response()->json(['message' => 'Deleted']);
    }

    public function addStock(Request $r, Product $product)
    {
        $d = $r->validate([
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $entry = $this->service->addStock($product, (int)$d['quantity'], (float)$d['unit_price'], $d['description'] ?? null);

        return response()->json([
            'entry'   => [
                'id'          => (string)$entry->id,
                'product_id'  => (string)$entry->product_id,
                'quantity'    => (int)$entry->quantity,
                'unit_price'  => (float)$entry->unit_price,
                'description' => $entry->description,
                'created_at'  => $entry->created_at?->toISOString(),
            ],
            'product' => $product->fresh(),
        ], 201);
    }

    public function recordSale(Request $r, Product $product)
    {
        $d = $r->validate([
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $sale = $this->service->recordSale($product, (int)$d['quantity'], (float)$d['unit_price'], $d['description'] ?? null);

        return response()->json([
            'sale'    => [
                'id'          => (string)$sale->id,
                'product_id'  => (string)$sale->product_id,
                'quantity'    => (int)$sale->quantity,
                'unit_price'  => (float)$sale->unit_price,
                'description' => $sale->description,
                'created_at'  => $sale->created_at?->toISOString(),
            ],
            'product' => $product->fresh(),
        ], 201);
    }
}
