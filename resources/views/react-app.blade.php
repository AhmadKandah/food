<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <title>Glaw Restaurant</title>

    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>

<body>
    <div id="root"></div>

    <script>
        window.__CURRENCY__ = @json([
            'symbol' => \App\Helpers\CurrencyHelper::symbol(),
            'code' => \App\Helpers\CurrencyHelper::code(),
            'decimals' => (int) config('currency.decimals', 2),
            'decimalSeparator' => config('currency.decimal_separator', '.'),
            'thousandsSeparator' => config('currency.thousands_separator', ','),
            'position' => config('currency.position', 'before'),
        ]);
    </script>
</body>

</html>
