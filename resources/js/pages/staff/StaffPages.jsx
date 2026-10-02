import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { staffService, getStaffError, getStaffFieldError } from '../../services/staff';
import { assetUrl } from '../../utils/assets';
import {
    OrderStatusModal,
    StaffAlert,
    StaffFieldError,
    StaffImageUploader,
    StaffPage,
    StaffPagination,
    StaffResultCount,
    StaffSearch,
    formatOrderTotal,
} from '../../components/staff/StaffUI';

const useStaffLoader = (loader, dependencies = []) => {
    const [state, setState] = useState({ data: null, loading: true, error: null });
    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey((key) => key + 1);
    useEffect(() => {
        let active = true;
        setState((current) => ({ ...current, loading: true, error: null }));
        loader().then((data) => active && setState({ data, loading: false, error: null })).catch((error) => active && setState({ data: null, loading: false, error }));
        return () => { active = false; };
        // Loader identity is intentionally controlled by the dependency list.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, reloadKey]);
    return { ...state, reload };
};

const useStaffSubmit = () => {
    const [state, setState] = useState({ saving: false, message: '', error: null });
    const submit = async (callback) => {
        setState({ saving: true, message: '', error: null });
        try {
            const result = await callback();
            setState({ saving: false, message: result?.message || 'Saved successfully.', error: null });
            return result;
        } catch (error) {
            setState({ saving: false, message: '', error });
            throw error;
        }
    };
    return { ...state, submit };
};

const valueOf = (event) => event.target.value;

export function StaffDashboardPage() {
    const { data, loading, error } = useStaffLoader(() => staffService.dashboard());
    const dashboard = data?.data || {};
    return <StaffPage className="dashboard" title="Dashboard">
        <div className="content"><StaffAlert message={error && getStaffError(error)} error /><div className="header"><h1>Dashboard</h1></div>
            <div className="statistic"><div className="item1"><i className="bx bxs-cart"></i><span>{dashboard.total_orders ?? '—'} Total Orders</span></div><div className="item2"><i className="bx bxl-product-hunt"></i><span>{dashboard.total_products ?? '—'} Total Products</span></div><div className="item3"><i className="bx bxs-dollar-circle"></i><span>{formatOrderTotal(dashboard.my_savings || 0)} My Savings</span></div></div>
            <div className="bottom-section"><div className="table-top"><h3>Manage Orders</h3><div className="button"><a href="#" className="delete" onClick={(event) => event.preventDefault()}><i className="bx bxs-minus-circle"></i><span>Delete</span></a><Link to="/staff/customer-order/create" className="add"><i className="bx bxs-plus-circle"></i><span>Create New</span></Link></div></div><table><thead><tr><th><input type="checkbox" /></th><th>Name</th><th>Email</th><th>Addess</th><th>Phone</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="6">Loading…</td></tr> : (dashboard.orders || []).map((order) => <tr key={order.id}><td><input type="checkbox" value={order.id} /></td><td>Order {order.customer_contact || order.id}</td><td>—</td><td>Table {order.table_number || '—'}</td><td>{order.customer_contact || '—'}</td><td><Link to="/staff/customer-order"><i className="bx bxs-pencil"></i><span>View</span></Link></td></tr>)}{!loading && !dashboard.orders?.length && <tr><td colSpan="6">No orders found.</td></tr>}</tbody></table></div>
        </div>
    </StaffPage>;
}

export function StaffOrdersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { data, loading, error, reload } = useStaffLoader(() => staffService.orders({ page, search }), [page, search]);
    const updateStatus = async (id, status) => { await staffService.updateOrderStatus(id, status); reload(); };
    const orders = data?.data || [];
    return <StaffPage className="customer-order-index" title="Customer Orders"><div className="content"><StaffAlert message={error && getStaffError(error)} error /><div className="header"><h1>Manage Customer Orders</h1></div><div className="statistic"><div className="item1"><i className="bx bxs-check-circle"></i><div className="data"><span className="title">Total Orders Completed</span><span className="data">{data?.statistics?.completed ?? '—'} Orders</span></div></div><div className="item2"><i className="bx bxs-info-circle"></i><div className="data"><span className="title">Total Orders Pending</span><span className="data">{data?.statistics?.pending ?? '—'} Still Pending</span></div></div><div className="item"></div></div><div className="bottom-section"><div className="table-top"><h3>Manage Orders</h3><div className="button"><StaffSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /><Link to="/staff/customer-order/create" className="add"><i className="bx bxs-plus-circle"></i><span>Check Table</span></Link></div></div><table><thead><tr><th><input type="checkbox" /></th><th>Table Number</th><th>Food Order</th><th>Order Status</th><th>Paid Status</th><th>Customer Contact No.</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading…</td></tr> : orders.map((order) => <tr key={order.id}><td><input type="checkbox" value={order.id} /></td><td>{order.table_number || '—'}</td><td>{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ') || '—'}</td><td>{order.order_status}</td><td>{order.is_paid ? 'True' : 'False'}</td><td>{order.customer_contact || '—'}</td><td><button type="button" className="modal-button" onClick={() => setSelectedOrder(order)}><i className="bx bxs-pencil"></i><span>Edit</span></button></td></tr>)}{!loading && !orders.length && <tr><td colSpan="7">No pending orders found.</td></tr>}</tbody></table><StaffResultCount meta={data?.meta} /><StaffPagination meta={data?.meta} onChange={setPage} /></div></div><OrderStatusModal order={selectedOrder} open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} onUpdated={updateStatus} /></StaffPage>;
}

const downloadQr = (table) => {
    const blob = new Blob([table.qr_code || ''], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `table-${table.table_number}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
};

export function StaffDiningTablesPage() {
    const [tableNumber, setTableNumber] = useState('');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState(null);
    const tables = useStaffLoader(() => staffService.diningTables({ page }), [page]);
    const submit = useStaffSubmit();
    const createTable = async (event) => { event.preventDefault(); try { const response = await submit.submit(() => staffService.createDiningTable({ table_number: tableNumber })); setResult(response?.data); setTableNumber(''); tables.reload(); } catch { /* alert below */ } };
    const copyLink = async () => { if (result?.url && navigator.clipboard) await navigator.clipboard.writeText(result.url); };
    return <StaffPage className="customer-order-create" title="Create Dining Table"><div className="content"><StaffAlert message={submit.error ? getStaffError(submit.error) : (tables.error && getStaffError(tables.error))} error={Boolean(submit.error || tables.error)} />{result && <div className="success-message left-green" style={{ position: 'relative', width: '100%', right: 'auto', top: 'auto' }}><i className="bx bxs-check-circle"></i><div className="text"><span>Success</span><span className="message">Table number successfully registered.</span><div className="table-link-info" style={{ marginTop: 10, padding: 10, background: '#f0f8ff', borderRadius: 5 }}><strong>Table Code:</strong> {result.code}<br /><strong>Table Link:</strong><input type="text" value={result.url || ''} readOnly style={{ width: 300, margin: '5px 0' }} /><button type="button" onClick={copyLink} style={{ marginLeft: 5, padding: '5px 10px' }}>Copy Link</button><div style={{ marginTop: 10 }} dangerouslySetInnerHTML={{ __html: result.qr_code || '' }} /></div></div></div>}
        <div className="header"><h1>Create Dining Table No.</h1></div><form onSubmit={createTable}><div className="create-section"><div className="header"><h4>Dining Table Details</h4></div><span className="star">Table No.</span><input type="text" value={tableNumber} onChange={(event) => setTableNumber(valueOf(event))} placeholder="Enter Table Number e.g. 12" required /><StaffFieldError>{getStaffFieldError(submit.error, 'table_number') || (submit.error?.userMessage && getStaffError(submit.error))}</StaffFieldError></div><div className="button-section"><input type="submit" value={submit.saving ? 'Saving…' : 'Add Table'} disabled={submit.saving} /><Link to="/staff/customer-order"><span>Cancel</span></Link></div></form>
        <div className="dining-table-section"><div className="table-top"><h3>Dining Tables</h3></div><table><thead><tr><th><input type="checkbox" /></th><th>Table No.</th><th>Status</th><th>QR Code</th><th></th></tr></thead><tbody>{tables.loading ? <tr><td colSpan="5">Loading…</td></tr> : tables.data?.data?.map((table) => <tr key={table.id}><td><input type="checkbox" value={table.id} /></td><td>{table.table_number}</td><td>{table.status}</td><td><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ width: 100, height: 100 }} dangerouslySetInnerHTML={{ __html: table.qr_code || '' }} /><button type="button" onClick={() => downloadQr(table)} style={{ padding: '5px 8px', background: '#28a745', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><i className="bx bx-download"></i>Download QR</button></div></td><td><a href="#" onClick={(event) => event.preventDefault()}><i className="bx bxs-pencil"></i><span>Edit</span></a></td></tr>)}{!tables.loading && !tables.data?.data?.length && <tr><td colSpan="5">No dining tables found.</td></tr>}</tbody></table><StaffResultCount meta={tables.data?.meta} /><StaffPagination meta={tables.data?.meta} onChange={setPage} /></div>
    </div></StaffPage>;
}

export function StaffReservationsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, loading, error, reload } = useStaffLoader(() => staffService.reservations({ page, search }), [page, search]);
    return <StaffPage className="reservation-index" title="Reservation"><div className="content"><StaffAlert message={error && getStaffError(error)} error /><div className="header"><h1>Manage Customer Reservation</h1></div><div className="reservation-status"><div className="container"><i className="bx bxs-bell"></i><div className="data"><span className="title">Reservation in-Progress</span><span className="data">{data?.statistics?.in_progress ?? '—'} Pending Reservations</span></div></div></div><div className="bottom-section"><div className="table-top"><h3>Manage Reservation</h3><StaffSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /></div><table><thead><tr><th><input type="checkbox" /></th><th>Name</th><th>Email</th><th>Contact No.</th><th>No. of Attendees</th><th>Date &amp; Time Arrival</th><th>Table</th><th>Status</th><th>Message</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="10">Loading…</td></tr> : data?.data?.map((reservation) => <tr key={reservation.id}><td><input type="checkbox" value={reservation.id} /></td><td>{reservation.name}</td><td>{reservation.email}</td><td>{reservation.contact}</td><td>{reservation.attendees}</td><td>{reservation.date} {reservation.time}</td><td>{reservation.table || 'Not Chosen'}</td><td>{reservation.status}</td><td>{reservation.message || '—'}</td><td><a href="#" onClick={(event) => event.preventDefault()}><i className="bx bxs-pencil"></i><span>Edit</span></a></td></tr>)}{!loading && !data?.data?.length && <tr><td colSpan="10">No reservations found.</td></tr>}</tbody></table><StaffResultCount meta={data?.meta} /><StaffPagination meta={data?.meta} onChange={setPage} /></div></div></StaffPage>;
}

export function StaffProfileShowPage() {
    const { data, loading, error } = useStaffLoader(() => staffService.profile());
    const profile = data?.data;
    const { id } = useParams();
    return <StaffPage className="staff-profile-show" title="Show Profile"><div className="content"><StaffAlert message={error && getStaffError(error)} error /><div className="header"><h1>Show Profile</h1></div><div className="container"><div className="photo">{profile?.photo ? <img src={assetUrl(profile.photo)} alt="User-Photo" /> : <i className="bx bxs-user-circle" style={{ fontSize: 180 }}></i>}</div><div className="profile-data"><span className="label">My Name</span><span className="data">{loading ? 'Loading…' : profile?.name || '—'}</span><span className="label">My Email</span><span className="data">{profile?.email || '—'}</span><span className="label">My Phone No.</span><span className="data">{profile?.phone || '—'}</span><span className="label">My Address</span><span className="data">{profile?.address || '—'}</span><span className="label">My Gender</span><span className="data">{profile?.gender || '—'}</span><span className="label">My Position in Company</span><span className="data">{profile?.position || '—'}</span></div></div><div className="button"><Link to={`/staff/staff-profile/${id}/edit`} className="edit"><span>Edit My Profile</span></Link><Link to="/staff/dashboard" className="back"><span>Back</span></Link></div></div></StaffPage>;
}

export function StaffProfileEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const profile = useStaffLoader(() => staffService.profile(), []);
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', position: '', gender: '' });
    const [file, setFile] = useState(null);
    const submit = useStaffSubmit();
    useEffect(() => { if (profile.data?.data) setForm({ name: profile.data.data.name || '', email: profile.data.data.email || '', phone: profile.data.data.phone || '', address: profile.data.data.address || '', position: profile.data.data.position || '', gender: profile.data.data.gender || '' }); }, [profile.data]);
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: valueOf(event) }));
    const update = async (event) => { event.preventDefault(); const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); if (file) body.append('photo', file); try { await submit.submit(() => staffService.updateProfile(body)); navigate(`/staff/staff-profile/${id}`); } catch { /* alert below */ } };
    return <StaffPage className="staff-profile-edit" title="Edit Profile"><div className="content"><StaffAlert message={profile.error ? getStaffError(profile.error) : submit.error ? getStaffError(submit.error) : ''} error /><div className="header"><h1>Edit Profile</h1></div><form onSubmit={update} encType="multipart/form-data"><div className="container"><StaffImageUploader file={file} value={profile.data?.data?.photo} onChange={setFile} /><div className="profile-data"><span className="label">Name</span><input type="text" name="name" value={form.name} onChange={set('name')} required /><StaffFieldError>{getStaffFieldError(submit.error, 'name')}</StaffFieldError><span className="label">Email</span><input type="email" name="email" value={form.email} onChange={set('email')} required /><StaffFieldError>{getStaffFieldError(submit.error, 'email')}</StaffFieldError><span className="label">Phone No.</span><input type="text" name="phone" value={form.phone || ''} onChange={set('phone')} /><span className="label">Address</span><input type="text" name="address" value={form.address || ''} onChange={set('address')} /><span className="label">Position</span><input type="text" name="position" value={form.position || ''} onChange={set('position')} /><span className="label">Gender</span><div className="input-radio"><label><input type="radio" value="Male" name="gender" checked={form.gender === 'Male'} onChange={set('gender')} /><span>Male</span></label><label><input type="radio" value="Female" name="gender" checked={form.gender === 'Female'} onChange={set('gender')} /><span>Female</span></label></div></div></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Update Profile'} disabled={submit.saving} /><Link to={`/staff/staff-profile/${id}`} className="cancel"><span>Cancel</span></Link></div></form></div></StaffPage>;
}
