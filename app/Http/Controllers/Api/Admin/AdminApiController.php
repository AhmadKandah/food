<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

abstract class AdminApiController extends Controller
{
    protected function validationResponse(Request $request, array $rules, array $messages = [])
    {
        $validator = Validator::make($request->all(), $rules, $messages);

        return $validator->fails()
            ? response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422)
            : null;
    }

    protected function paginated($paginator, callable $transform): array
    {
        return [
            'data' => collect($paginator->items())->map($transform)->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];
    }

    protected function serverError(\Throwable $exception)
    {
        report($exception);

        return response()->json(['message' => 'Unable to complete the request.'], 500);
    }

    protected function storeImage($file, string $directory): string
    {
        $target = public_path($directory);
        if (!is_dir($target)) mkdir($target, 0755, true);
        $filename = $file->hashName();
        $file->move($target, $filename);

        return trim($directory, '/').'/'.$filename;
    }

    protected function deleteImage(?string $path): void
    {
        if (!$path) return;
        $publicPath = public_path(ltrim($path, '/'));
        if (File::exists($publicPath)) File::delete($publicPath);
    }
}
