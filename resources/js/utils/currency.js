const currency = {
    symbol: '$',
    code: 'USD',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    position: 'before',
    ...(window.__CURRENCY__ || {}),
};

export const formatCurrency = (amount) => {
    const fixedAmount = Number(amount || 0).toFixed(currency.decimals);
    const [integerPart, decimalPart] = fixedAmount.split('.');
    const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
    const formattedAmount = currency.decimals > 0
        ? `${groupedInteger}${currency.decimalSeparator}${decimalPart}`
        : groupedInteger;

    return currency.position === 'after'
        ? `${formattedAmount}${currency.symbol}`
        : `${currency.symbol}${formattedAmount}`;
};

export const currencyConfig = currency;
