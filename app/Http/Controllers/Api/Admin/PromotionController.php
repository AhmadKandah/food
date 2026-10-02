<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\CouponStatusEnum;
use App\Models\PromotionDiscount;
use App\Models\PromotionEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class PromotionController extends AdminApiController
{
    public function discounts(Request $request): JsonResponse
    {
        $query = PromotionDiscount::with('promotionEvent');
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($builder) => $builder
                ->where('coupon_code', 'like', '%'.$search.'%')
                ->orWhere('coupon_name', 'like', '%'.$search.'%')
                ->orWhere('discount', 'like', '%'.$search.'%')
                ->orWhereHas('promotionEvent', fn ($event) => $event->where('event_name', 'like', '%'.$search.'%')));
        }
        $discounts = $query->latest()->paginate((int) $request->input('per_page', 10));

        return response()->json($this->paginated($discounts, fn (PromotionDiscount $discount) => $this->discountData($discount)));
    }

    public function showDiscount(string $id): JsonResponse
    {
        $discount = PromotionDiscount::with('promotionEvent')->find($id);
        return $discount
            ? response()->json(['data' => $this->discountData($discount, true)])
            : response()->json(['message' => 'Promotion discount not found.'], 404);
    }

    public function storeDiscount(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'coupon_name' => ['required', 'string', 'max:255'],
            'discount' => ['required', 'numeric', 'min:0.01', 'max:1.00'],
            'event_id' => ['required', 'exists:promotion_events,id'],
            'validity' => ['required', 'date'],
        ]);
        if ($response) return $response;
        $discount = PromotionDiscount::create([
            'coupon_code' => (string) Str::uuid(),
            'coupon_name' => $request->input('coupon_name'),
            'discount' => $request->input('discount'),
            'event_id' => $request->input('event_id'),
            'validity' => $request->input('validity'),
            'redeem_status' => CouponStatusEnum::NotRedeemed,
        ]);

        return response()->json(['message' => 'Coupon created successfully.', 'data' => $this->discountData($discount->load('promotionEvent'), true)], 201);
    }

    public function updateDiscount(Request $request, string $id): JsonResponse
    {
        $discount = PromotionDiscount::find($id);
        if (!$discount) return response()->json(['message' => 'Promotion discount not found.'], 404);
        $response = $this->validationResponse($request, [
            'coupon_name' => ['required', 'string', 'max:255'],
            'discount' => ['required', 'numeric', 'min:0.01', 'max:1.00'],
            'event_id' => ['required', 'exists:promotion_events,id'],
            'validity' => ['required', 'date'],
            'redeem_status' => ['nullable', Rule::in(array_map(fn ($status) => $status->value, CouponStatusEnum::cases()))],
        ]);
        if ($response) return $response;
        $discount->update($request->only(['coupon_name', 'discount', 'event_id', 'validity', 'redeem_status']));

        return response()->json(['message' => 'Coupon updated successfully.', 'data' => $this->discountData($discount->fresh()->load('promotionEvent'), true)]);
    }

    public function destroyDiscount(string $id): JsonResponse
    {
        $discount = PromotionDiscount::find($id);
        if (!$discount) return response()->json(['message' => 'Promotion discount not found.'], 404);
        $discount->delete();

        return response()->json(['message' => 'Coupon deleted successfully.']);
    }

    public function events(Request $request): JsonResponse
    {
        $query = PromotionEvent::query();
        if ($request->filled('search')) $query->where('event_name', 'like', '%'.$request->input('search').'%');
        $events = $query->latest()->paginate((int) $request->input('per_page', 5));

        return response()->json($this->paginated($events, fn (PromotionEvent $event) => $this->eventData($event)));
    }

    public function storeEvent(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'event_name' => ['required', 'string', 'max:255', 'unique:promotion_events,event_name'],
            'event_date' => ['required', 'date'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,svg', 'max:10480'],
        ]);
        if ($response) return $response;
        $event = PromotionEvent::create([
            'event_name' => $request->input('event_name'),
            'event_date' => $request->input('event_date'),
            'event_image' => $this->storeImage($request->file('image'), 'images/promotion-event'),
        ]);

        return response()->json(['message' => 'Event created successfully.', 'data' => $this->eventData($event)], 201);
    }

    public function updateEvent(Request $request, string $id): JsonResponse
    {
        $event = PromotionEvent::find($id);
        if (!$event) return response()->json(['message' => 'Promotion event not found.'], 404);
        $response = $this->validationResponse($request, [
            'event_name' => ['required', 'string', 'max:255', Rule::unique('promotion_events', 'event_name')->ignore($event->id)],
            'event_date' => ['required', 'date'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg', 'max:10480'],
        ]);
        if ($response) return $response;
        $data = $request->only(['event_name', 'event_date']);
        if ($request->hasFile('image')) {
            if ($event->event_image) $this->deleteImage($event->event_image);
            $data['event_image'] = $this->storeImage($request->file('image'), 'images/promotion-event');
        }
        $event->update($data);

        return response()->json(['message' => 'Event updated successfully.', 'data' => $this->eventData($event->fresh())]);
    }

    public function destroyEvent(string $id): JsonResponse
    {
        $event = PromotionEvent::find($id);
        if (!$event) return response()->json(['message' => 'Promotion event not found.'], 404);
        if ($event->promotionDiscount()->exists()) return response()->json(['message' => 'This event has coupons and cannot be deleted.'], 409);
        if ($event->event_image) $this->deleteImage($event->event_image);
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }

    private function discountData(PromotionDiscount $discount, bool $details = false): array
    {
        return [
            'id' => $discount->id,
            'coupon_code' => $discount->coupon_code,
            'coupon_name' => $discount->coupon_name,
            'discount' => (float) $discount->discount,
            'status' => $discount->redeem_status?->value ?? (string) $discount->redeem_status,
            'event_id' => $discount->event_id,
            'event' => $discount->promotionEvent?->event_name,
            'validity' => $discount->validity,
            'date_redeemed' => $discount->date_redeemed,
            'qr_code' => (string) QrCode::size(150)->generate($discount->coupon_code),
        ];
    }

    private function eventData(PromotionEvent $event): array
    {
        return [
            'id' => $event->id,
            'event_name' => $event->event_name,
            'event_date' => $event->event_date,
            'image' => $event->event_image,
        ];
    }
}
