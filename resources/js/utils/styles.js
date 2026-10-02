import { useLayoutEffect } from 'react';

const layoutStyleId = 'react-layout-style';
const iconStyleId = 'react-boxicons-style';

export function useLayoutStyles(stylesheet) {
    useLayoutEffect(() => {
        let layoutStyle = document.getElementById(layoutStyleId);

        if (!layoutStyle) {
            layoutStyle = document.createElement('link');
            layoutStyle.id = layoutStyleId;
            layoutStyle.rel = 'stylesheet';
            document.head.appendChild(layoutStyle);
        }

        layoutStyle.href = stylesheet;

        let iconStyle = document.getElementById(iconStyleId);

        if (!iconStyle) {
            iconStyle = document.createElement('link');
            iconStyle.id = iconStyleId;
            iconStyle.rel = 'stylesheet';
            iconStyle.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
            document.head.appendChild(iconStyle);
        }

        return () => {
            layoutStyle?.remove();
            iconStyle?.remove();
        };
    }, [stylesheet]);
}
