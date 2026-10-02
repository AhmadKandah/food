import React, { useEffect, useRef, useState } from 'react';

import { assetUrl } from '../../utils/assets';
import { formatCurrency } from '../../utils/currency';
import { getStaffError } from '../../services/staff';

export function StaffPage({ className, title, children }) {
    useEffect(() => { document.title = title || 'Staff'; }, [title]);
    return <section><div className={className}><main>{children}</main></div></section>;
}

export function StaffAlert({ message, error = false }) {
    if (!message) return null;
    return <div className={`${error ? 'error-message left-red' : 'success-message left-green'}`}>
        <i className={`bx ${error ? 'bxs-x-circle' : 'bxs-check-circle'}`}></i>
        <div className="text"><span>{error ? 'Error' : 'Success'}</span><span className="message">{message}</span></div>
    </div>;
}

export function StaffFieldError({ children }) {
    return children ? <div className="validation-error-message">{children}</div> : null;
}

export function StaffPagination({ meta, onChange }) {
    if (!meta || meta.last_page <= 1) return null;
    const current = Number(meta.current_page || 1);
    return <div className="staff-pagination" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16 }}>
        <button type="button" disabled={current <= 1} onClick={() => onChange(current - 1)}>Previous</button>
        {Array.from({ length: meta.last_page }, (_, index) => index + 1).map((page) => <button type="button" className={page === current ? 'active' : ''} key={page} onClick={() => onChange(page)}>{page}</button>)}
        <button type="button" disabled={current >= meta.last_page} onClick={() => onChange(current + 1)}>Next</button>
    </div>;
}

export function StaffResultCount({ meta }) {
    return <div className="staff-result-count" style={{ paddingTop: 16, color: 'var(--dark-grey)' }}>{meta?.total ? `Showing ${meta.from} to ${meta.to} out of ${meta.total} results` : 'No results found'}</div>;
}

export function StaffSearch({ value, onChange, onSubmit, placeholder = 'Search' }) {
    return <form onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div className="search-field"><i className="bx bx-search" onClick={onSubmit}></i><input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div>
    </form>;
}

export function StaffImageUploader({ file, value, onChange }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(value ? assetUrl(value) : '');
    useEffect(() => { setPreview(value ? assetUrl(value) : ''); }, [value]);
    const choose = (files) => {
        const next = files?.[0];
        if (!next) return;
        onChange(next);
        setPreview(URL.createObjectURL(next));
    };
    return <div className="drag-area" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files); }}>
        {preview ? <img src={preview} alt="Profile preview" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }} /> : <><i className="bx bxs-cloud-upload"></i><h2 className="drag-text">Drag and drop to upload image</h2></>}
        <input ref={inputRef} type="file" hidden name="profile_image" accept="image/*" className="select-image-input" onChange={(event) => choose(event.target.files)} />
    </div>;
}

export function OrderStatusModal({ order, open, onClose, onUpdated }) {
    const [nextStatus, setNextStatus] = useState('Preparing');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => { setNextStatus(order?.order_status || 'Preparing'); setError(''); }, [order]);
    const update = async () => {
        if (!order || nextStatus !== 'Completed') return;
        setSaving(true); setError('');
        try {
            await onUpdated(order.id, nextStatus);
            onClose();
        } catch (requestError) {
            setError(getStaffError(requestError));
        } finally { setSaving(false); }
    };
    return <div className="modal-edit-order" style={{ visibility: open ? 'visible' : 'hidden', opacity: open ? 1 : 0 }}>
        <div className="wrapper"><h2>Manage Order</h2><i className="bx bx-x" id="modal-close" onClick={onClose}></i><div className="content"><div className="container">
            {order && <>
                <div className="input-data"><span className="label">Table No.</span><span className="data">{order.table_number || '—'}</span></div>
                <div className="order-status"><span className="label">Order Status</span><div className="status"><span className={`data${nextStatus === 'Completed' ? ' completed' : ''}`}>{nextStatus}</span>{order.order_status !== 'Completed' && <span className="edit" id="edit-order-status" onClick={() => setNextStatus('Completed')}>Change to Completed</span>}</div></div>
                <div className="food-list-order"><span className="label">Food Order</span><div className="list">{order.items?.map((item, index) => <React.Fragment key={`${item.id}-${index}`}><span>{item.name} × {item.quantity}</span>{index < order.items.length - 1 && <span>,</span>}</React.Fragment>)}</div></div>
                <StaffFieldError>{error}</StaffFieldError>
                <div className="button-section"><input type="button" value={saving ? 'Updating…' : 'Update Status'} disabled={saving || nextStatus !== 'Completed' || order.order_status === 'Completed'} onClick={update} /><button type="button" className="cancel" onClick={onClose}><span>Cancel</span></button></div>
            </>}
        </div></div></div>
    </div>;
}

export function formatOrderTotal(value) {
    return formatCurrency(value);
}

