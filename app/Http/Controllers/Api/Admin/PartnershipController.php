<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Partnership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnershipController extends AdminApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Partnership::query();
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($builder) => $builder
                ->where('company_name', 'like', '%'.$search.'%')
                ->orWhere('owner_name', 'like', '%'.$search.'%')
                ->orWhere('location', 'like', '%'.$search.'%'));
        }
        $partners = $query->latest()->paginate((int) $request->input('per_page', 12));

        return response()->json($this->paginated($partners, fn (Partnership $partner) => $this->partnerData($partner)));
    }

    public function show(string $id): JsonResponse
    {
        $partner = Partnership::find($id);
        return $partner
            ? response()->json(['data' => $this->partnerData($partner)])
            : response()->json(['message' => 'Partnership not found.'], 404);
    }

    public function store(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,svg', 'max:10480'],
            'company_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'location' => ['required', 'string', 'max:255'],
        ]);
        if ($response) return $response;
        $partner = Partnership::create([
            'image' => $this->storeImage($request->file('image'), 'images/partnership'),
            'company_name' => $request->input('company_name'),
            'owner_name' => $request->input('owner_name'),
            'date_join' => $request->input('date'),
            'location' => $request->input('location'),
        ]);

        return response()->json(['message' => 'Partner added successfully.', 'data' => $this->partnerData($partner)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $partner = Partnership::find($id);
        if (!$partner) return response()->json(['message' => 'Partnership not found.'], 404);
        $response = $this->validationResponse($request, [
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg', 'max:10480'],
            'company_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'location' => ['required', 'string', 'max:255'],
        ]);
        if ($response) return $response;
        $data = [
            'company_name' => $request->input('company_name'),
            'owner_name' => $request->input('owner_name'),
            'date_join' => $request->input('date'),
            'location' => $request->input('location'),
        ];
        if ($request->hasFile('image')) {
            if ($partner->image) $this->deleteImage($partner->image);
            $data['image'] = $this->storeImage($request->file('image'), 'images/partnership');
        }
        $partner->update($data);

        return response()->json(['message' => 'Partnership updated successfully.', 'data' => $this->partnerData($partner->fresh())]);
    }

    public function destroy(string $id): JsonResponse
    {
        $partner = Partnership::find($id);
        if (!$partner) return response()->json(['message' => 'Partnership not found.'], 404);
        if ($partner->image) $this->deleteImage($partner->image);
        $partner->delete();

        return response()->json(['message' => 'Partnership deleted successfully.']);
    }

    private function partnerData(Partnership $partner): array
    {
        return [
            'id' => $partner->id,
            'company_name' => $partner->company_name,
            'owner_name' => $partner->owner_name,
            'date' => $partner->date_join,
            'location' => $partner->location,
            'image' => $partner->image,
        ];
    }
}
