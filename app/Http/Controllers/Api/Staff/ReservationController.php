<?php

namespace App\Http\Controllers\Api\Staff;

use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends StaffApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::with('diningTable');
        if ($request->filled('status')) $query->where('reservation_status', $request->input('status'));
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($builder) => $builder
                ->where('reservation_name', 'like', '%'.$search.'%')
                ->orWhere('reservation_email', 'like', '%'.$search.'%')
                ->orWhere('reservation_contact', 'like', '%'.$search.'%')
                ->orWhere('reservation_message', 'like', '%'.$search.'%'));
        }
        $reservations = $query->latest('reservation_date')->latest('reservation_time')->paginate((int) $request->input('per_page', 10));

        return response()->json([
            ...$this->paginated($reservations, fn (Reservation $reservation) => $this->reservationData($reservation)),
            'statistics' => [
                'in_progress' => Reservation::where('reservation_status', 'Pending')->count(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $reservation = Reservation::with('diningTable')->find($id);
        return $reservation
            ? response()->json(['data' => $this->reservationData($reservation)])
            : response()->json(['message' => 'Reservation not found.'], 404);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $reservation = Reservation::find($id);
        if (!$reservation) return response()->json(['message' => 'Reservation not found.'], 404);
        $response = $this->validationResponse($request, ['status' => ['required', 'in:Pending,Completed,Cancelled']]);
        if ($response) return $response;
        $reservation->update(['reservation_status' => $request->input('status')]);

        return response()->json(['message' => 'Reservation status updated successfully.', 'data' => $this->reservationData($reservation->fresh()->load('diningTable'))]);
    }

    private function reservationData(Reservation $reservation): array
    {
        return [
            'id' => $reservation->id,
            'name' => $reservation->reservation_name,
            'email' => $reservation->reservation_email,
            'contact' => $reservation->reservation_contact,
            'attendees' => $reservation->reservation_attendees,
            'date' => $reservation->reservation_date,
            'time' => $reservation->reservation_time,
            'table' => $reservation->diningTable?->table_name ?? $reservation->dining_table_id,
            'table_id' => $reservation->dining_table_id,
            'status' => $reservation->reservation_status,
            'message' => $reservation->reservation_message,
        ];
    }
}
