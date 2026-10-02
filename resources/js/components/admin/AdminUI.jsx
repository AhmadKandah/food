import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { assetUrl } from '../../utils/assets';

export function AdminPage({ className, title, children }) {
    useEffect(() => { document.title = title || 'Admin'; }, [title]);

    return <div className={className}><section><main>{children}</main></section></div>;
}

export function AdminHeader({ title, createHref, createLabel, children }) {
    return <div className="header">
        <div className="left"><h1>{title}</h1></div>
        {children}
        {createHref && <Link to={createHref} className="create"><span>{createLabel}</span></Link>}
    </div>;
}

export function AdminAlert({ message, error = false, onClose }) {
    if (!message) return null;
    return <div className={error ? 'error-message' : 'success-message'}>
        <i className={`bx ${error ? 'bxs-error-circle' : 'bxs-check-circle'}`}></i>
        <div className="text"><span>{error ? 'Error' : 'Success'}</span><span className="message">{message}</span></div>
        {onClose && <button type="button" onClick={onClose} aria-label="Close">×</button>}
    </div>;
}

export function AdminPagination({ meta, onChange }) {
    if (!meta || meta.last_page <= 1) return null;
    const page = Number(meta.current_page || 1);
    const pages = Array.from({ length: meta.last_page }, (_, index) => index + 1);
    return <nav><div className="pagination-number">
        <div className="page"><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}><i className="bx bx-chevron-left"></i> Previous</button></div>
        <div className="page-number">{pages.map((number) => <button type="button" className={number === page ? 'active' : ''} key={number} onClick={() => onChange(number)}>{number}</button>)}</div>
        <div className="page"><button type="button" disabled={page >= meta.last_page} onClick={() => onChange(page + 1)}>Next <i className="bx bx-chevron-right"></i></button></div>
    </div></nav>;
}

export function AdminSearch({ value, onChange, onSubmit, placeholder = 'Search' }) {
    return <form onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }}>
        <div className="search-field"><i className="bx bx-search" onClick={onSubmit}></i><input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div>
    </form>;
}

export function AdminDropdown({ value, options, onChange, name = 'category_id', placeholder = 'Select Category' }) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => String(option.id) === String(value));
    return <div className={`dropdown${open ? ' active' : ''}`}>
        <div className="select" onClick={() => setOpen((state) => !state)}><span className="selected">{selected?.name || placeholder}</span><div className="caret"><i className="bx bx-chevron-down"></i></div></div>
        <ul className={`menu${open ? ' active' : ''}`}>{options.map((option) => <li key={option.id} className={String(option.id) === String(value) ? 'active' : ''} onClick={() => { onChange(option.id); setOpen(false); }}>{option.name}</li>)}</ul>
        <input type="hidden" name={name} value={value || ''} readOnly />
    </div>;
}

export function AdminUploader({ file, value, onChange, required = false }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(value ? assetUrl(value) : '');

    useEffect(() => { setPreview(value ? assetUrl(value) : ''); }, [value]);
    const selectFile = (selected) => {
        const next = selected?.[0];
        if (!next) return;
        onChange(next);
        setPreview(URL.createObjectURL(next));
    };
    return <div className="drag-area" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files); }}>
        {preview ? <img src={preview} alt="Preview" className="image-preview" /> : <><i className="bx bxs-cloud-upload"></i><h2 className="drag-text">Drag and drop to upload image</h2></>}
        <input ref={inputRef} type="file" hidden className="select-image-input" accept="image/*" required={required && !file && !value} onChange={(event) => selectFile(event.target.files)} />
    </div>;
}

export function DeleteModal({ open, title = 'Warning', message = 'Are you sure you want to delete this data?', onCancel, onConfirm }) {
    if (!open) return null;
    return <div className="delete-confirmation" id="deletePopup" role="dialog" aria-modal="true"><i className="bx bxs-info-circle"></i><h1>{title}</h1><h3>{message}</h3><p>Once deleted, you will not be able to recover this data!</p><div className="button"><button type="button" className="close-popup" onClick={onCancel}>Cancel</button><button type="button" className="confirm-delete" onClick={onConfirm}>Delete</button></div></div>;
}

export function ErrorText({ children }) { return children ? <div className="validation-error-message">{children}</div> : null; }

export function TablePagination({ meta, onChange }) {
    return <div className="pagination"><div className="count">{meta?.total ? `Showing ${meta.from} to ${meta.to} out of ${meta.total} results` : 'No results found'}</div><div className="pagination-number"><div className="page-number"><AdminPagination meta={meta} onChange={onChange} /></div></div></div>;
}

export function AdminImage({ path, alt = '', className = '' }) {
    return path ? <img src={assetUrl(path)} alt={alt} className={className} /> : <span>—</span>;
}
