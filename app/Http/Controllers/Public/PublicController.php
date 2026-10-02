<?php

namespace App\Http\Controllers\Public;

use App\Enums\OrderStatusEnum;
use App\Enums\ReservationStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustomerOrder;
use App\Models\CustomerOrderDetail;
use App\Models\DiningTable;
use App\Models\FoodCategory;
use App\Models\FoodMenu;
use App\Models\PromotionDiscount;
use App\Models\PromotionEvent;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\View\View;

class PublicController extends Controller
{
    public function home() : View
    {
        $menu = FoodMenu::all();

        return view('public.home', compact('menu'));
    }




    /*
    *  Function to view menu file
    */
    public function menu(Request $request) : View
    {
        $query = FoodMenu::with('foodCategory');
        
        // Filter by category if selected
        if ($request->has('category') && $request->category != '') {
            $query->where('category_id', $request->category);
        }
        
        // Filter by search keyword if provided
        if ($request->has('search') && $request->search != '') {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', '%' . $keyword . '%')
                  ->orWhere('description', 'like', '%' . $keyword . '%')
                  ->orWhereHas('foodCategory', function ($subQuery) use ($keyword) {
                      $subQuery->where('name', 'like', '%' . $keyword . '%');
                  });
            });
        }
        
        // Default sorting by name
        $query->orderBy('name', 'asc');
        
        $menu = $query->get();
        $categories = FoodCategory::orderBy('name', 'asc')->get();
        
        // Get selected filters for maintaining state
        $selectedCategory = $request->category ?? '';
        $searchKeyword = $request->search ?? '';
        
        // Debug information
        Log::info('Menu filters applied', [
            'category' => $selectedCategory,
            'search' => $searchKeyword,
            'results_count' => $menu->count(),
            'total_categories' => $categories->count(),
            'request_all' => $request->all()
        ]);
        
        // Check if we have data
        if ($menu->isEmpty()) {
            Log::warning('No food items found in database');
        }
        
        if ($categories->isEmpty()) {
            Log::warning('No food categories found in database');
        }
        
        return view('public.menu', compact('menu', 'categories', 'selectedCategory', 'searchKeyword'));
    }





    /*
    *  Function to view about file
    */
    public function about() : View
    {
        return view('public.about');
    }






    /*
    *  Function to view promotion file
    */
    public function promotion() : View
    {
        // Get current date
        $currentMonth = Carbon::now();

        // Get month before now
        $monthBefore = Carbon::now()->subMonth();

        // Get event available if user is within the event month and one month after even
        // Other than that the promotion is unavailable
        $promotion = PromotionEvent::where(function ($query) use ($currentMonth, $monthBefore) {
            $query->whereMonth('event_date', '=', $currentMonth)
                ->orWhereMonth('event_date', '=', $monthBefore);
        })->get();

        // Initialize as empty array to store coupon based on $promotion
        $coupon = [];

        foreach ($promotion as $event) {
            $eventCoupon = PromotionDiscount::where('event_id', $event->id)->get();
            $coupon[$event->id] = $eventCoupon;
        }

        $menu = FoodMenu::where('price', '>', 27.00)->get();

        return view('public.promotion', compact('promotion', 'coupon', 'menu'));
    }







    /*
    *  Function to view reservation file
    */
    public function reservation() : View
    {
        return view('public.reservation');
    }






    /*
    *  Function to search (redirects to menu with search parameter)
    */
    public function search(Request $request) : RedirectResponse
    {
        $keyword = $request->input('search');
        
        return redirect()->route('menu', ['search' => $keyword]);
    }






    /*
    *  Function for add to cart
    */
    public function createOrder(Request $request) : JsonResponse
    {
        // Log the incoming request
        Log::info('createOrder method called', [
            'request_data' => $request->all(),
            'cart_data' => $request->input('cartData'),
            'total_amount' => $request->input('totalAmount'),
            'table_number' => $request->input('table_number'),
            'customer_contact' => $request->input('customer_contact')
        ]);

        // Retrieve the JSON data from the request
        $cartItem = $request->input('cartData');
        $totalPrice = $request->input('totalAmount');

        // Get table number input and order number
        $tableNumber = $request->input('table_number');
        $orderNumber = $request->input('customer_contact'); // This field now contains order number

        // Validate required fields
        if (empty($tableNumber)) {
            return response()->json([
                'validation-error-message' => 'Table number is required.',
            ], 422);
        }

        if (empty($orderNumber)) {
            return response()->json([
                'validation-error-message' => 'Order number is required.',
            ], 422);
        }

        // Validate order number is numeric and positive
        if (!is_numeric($orderNumber) || $orderNumber < 1) {
            return response()->json([
                'validation-error-message' => 'Order number must be a positive number.',
            ], 422);
        }

        // Get table record
        $table = DiningTable::where('table_name', $tableNumber)->first();

        // If table not exists
        if (!$table) {
            return response()->json([
                'validation-error-message' => 'Table does not exists. Plese enter a correct table number.',
            ], 422);
        }

        // Check if this order number already has an active order for this table
        $existingOrder = CustomerOrder::where('dining_table_id', $table->id)
            ->where('customer_contact', $orderNumber)
            ->where('order_status', OrderStatusEnum::Preparing)
            ->first();

        if ($existingOrder) {
            return response()->json([
                'validation-error-message' => 'Order number ' . $orderNumber . ' already has an active order for this table. Please wait for it to be completed or use a different order number.',
            ], 422);
        }

        // If table is occupied by another order number
        if ($table->isOccupied) {
            // Check if it's occupied by the same order number
            $occupyingOrder = CustomerOrder::where('dining_table_id', $table->id)
                ->where('order_status', OrderStatusEnum::Preparing)
                ->first();
            
            if ($occupyingOrder && $occupyingOrder->customer_contact !== $orderNumber) {
                return response()->json([
                    'validation-error-message' => 'Table is taken by order number ' . $occupyingOrder->customer_contact . '. Please enter another table number.',
                ], 422);
            }
        }

        // Table exists and table is not accupied then update isOccupied to true
        $table->update(['isOccupied' => true]);

        // Create order
        $order = CustomerOrder::create([
            'dining_table_id' => $table->id,
            'order_total_price' => $totalPrice,
            'isPaid' => false,
            'order_status' => OrderStatusEnum::Preparing,
            'customer_contact' => $orderNumber,
            'user_id' => $orderNumber, // Using order number as user identifier
        ]);

        // Get order id
        $orderId = $order->id;

        foreach ($cartItem as $item) {
            // Create order details
            $orderDetails = CustomerOrderDetail::create([
                'order_id' => $orderId,
                'food_id' => $item['id'],
                'quantity' => $item['quantity'],
                'total_price' => $item['eachTotalPrice'],
            ]);
        }

        Log::info([$table, $order, $orderDetails]);

        return response()->json([
            'success-message' => 'Your order is being processed. Please wait 15 - 30 minutes for us to prepare your food.',
        ]);
    }



    

    /*
    *  Function for reservation
    */
    public function makeReservation(Request $request) : RedirectResponse
    {
        $validator = $this->reservationValidator($request);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $reservation = $this->storeReservation($request);

        Log::info($reservation);

        return back()->with('success-message', 'We have received your reservation. We will process immediately and we will contact you as soon as possible. Thank you.');
    }

    public function makeReservationApi(Request $request) : JsonResponse
    {
        $validator = $this->reservationValidator($request);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reservation = $this->storeReservation($request);

        Log::info($reservation);

        return response()->json([
            'message' => 'We have received your reservation. We will process immediately and we will contact you as soon as possible. Thank you.',
            'success-message' => 'We have received your reservation. We will process immediately and we will contact you as soon as possible. Thank you.',
        ], 201);
    }

    private function reservationValidator(Request $request)
    {
        return Validator::make($request->all(), [
            'book_name' => 'required|max:255',
            'book_email' => 'required|email',
            'book_phone' => 'required|numeric',
            'guest_number' => 'required|numeric|min:2',
            'book_date' => 'required|date|after:today',
            'book_time' => 'required|date_format:H:i',
            'book_message' => 'max:999999',
        ]);
    }

    private function storeReservation(Request $request): Reservation
    {
        return Reservation::create([
            'reservation_name' => $request->book_name,
            'reservation_email' => $request->book_email,
            'reservation_contact' => $request->book_phone,
            'reservation_attendees' => $request->guest_number,
            'reservation_date' => $request->book_date,
            'reservation_time' => $request->book_time,
            'reservation_message' => $request->book_message,
            'dining_table_id' => null,
            'reservation_status' => ReservationStatusEnum::Pending,
        ]);
    }
}
