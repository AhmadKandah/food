import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { adminService, getAdminError, getFieldError } from '../../services/admin';
import { formatCurrency } from '../../utils/currency';
import {
    AdminAlert,
    AdminDropdown,
    AdminHeader,
    AdminImage,
    AdminPage,
    AdminSearch,
    AdminUploader,
    DeleteModal,
    ErrorText,
    TablePagination,
} from '../../components/admin/AdminUI';

const useAdminLoader = (loader, dependencies = []) => {
    const [state, setState] = useState({ data: null, loading: true, error: '' });
    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey((key) => key + 1);
    useEffect(() => {
        let active = true;
        setState((current) => ({ ...current, loading: true, error: '' }));
        loader().then((data) => active && setState({ data, loading: false, error: '' })).catch((error) => active && setState({ data: null, loading: false, error: getAdminError(error) }));
        return () => { active = false; };
        // The caller controls loader identity through explicit dependencies.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, reloadKey]);
    return { ...state, reload };
};

const useSubmit = () => {
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

const inputValue = (event) => event.target.value;

export function DashboardPage() {
    const { data, loading, error } = useAdminLoader(() => adminService.dashboard());
    const dashboard = data?.data || {};
    return <AdminPage className="dashboard" title="Dashboard">
        <AdminAlert message={error} error />
        <AdminHeader title="Dashboard"><ul className="breadcrumb"><li><a href="#" className="active">Analytics</a></li> / <li><a href="#">Staff</a></li></ul><a href="#" className="report" onClick={(event) => event.preventDefault()}><i className="bx bx-cloud-download"></i><span>Download CSV</span></a></AdminHeader>
        <ul className="insights">
            <li><i className="bx bxs-user"></i><span className="info"><h3>{dashboard.total_staff ?? '—'}</h3><p>Total Staff</p></span></li>
            <li><i className="bx bx-show-alt"></i><span className="info"><h3>{dashboard.site_visits ?? '—'}</h3><p>Site Visit</p></span></li>
            <li><i className="bx bx-line-chart"></i><span className="info"><h3>{dashboard.total_sales !== undefined ? formatCurrency(dashboard.total_sales) : '—'}</h3><p>Total Sales</p></span></li>
        </ul>
        <div className="bottom-section">
            <div className="orders"><div className="header"><i className="bx bx-receipt"></i><h3>Recent Orders</h3><i className="bx bx-filter"></i><i className="bx bx-search"></i></div>
                <table><thead><tr><th>User</th><th>Order Date</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td colSpan="3">Loading…</td></tr> : (dashboard.orders || []).map((order) => <tr key={order.id}><td><i className="bx bxs-user-circle"></i><p>Table {order.table}</p></td><td>{order.date || '—'}</td><td><span className={`status ${String(order.status).toLowerCase() === 'completed' ? 'completed' : 'process'}`}>{order.status || 'Pending'}</span></td></tr>)}</tbody></table>
            </div>
            <div className="reminders"><div className="header"><i className="bx bx-note"></i><h3>Reminders</h3><i className="bx bx-filter"></i><i className="bx bx-plus"></i></div><ul className="task-list">{(dashboard.reminders || []).map((reminder) => <li className={reminder.completed ? 'completed' : 'not-completed'} key={reminder.id}><div className="task-title"><i className={`bx ${reminder.completed ? 'bx-check-circle' : 'bx-x-circle'}`}></i><p>{reminder.title}</p></div><i className="bx bx-dots-vertical-rounded"></i></li>)}{!dashboard.reminders?.length && <li className="not-completed"><div className="task-title"><i className="bx bx-note"></i><p>No reminders</p></div></li>}</ul></div>
        </div>
    </AdminPage>;
}

export function StaffAccountIndexPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, loading, error, reload } = useAdminLoader(() => adminService.staff({ search, page }), [search, page]);
    return <AdminPage className="staff-account-index" title="Staff Account">
        <AdminAlert message={error} error />
        <AdminHeader title="Staff Account" createHref="/admin/staff-account/create" createLabel="Create New Staff ID" />
        <div className="custom-card1"><div className="container"><div className="header"><i className="bx bx-detail"></i><h3>Staff Details</h3><i className="bx bx-filter"></i><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /></div>
            <table id="CompanyStaffAccountIndex" className="table1"><thead><tr><th><input type="checkbox" aria-label="Select all" /></th><th>Staff ID</th><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="6">Loading…</td></tr> : data?.data?.map((staff) => <tr key={staff.id}><td><input type="checkbox" value={staff.id} /></td><td>{staff.staff_id}</td><td>{staff.name}</td><td>{staff.email}</td><td>{staff.phone || '—'}</td><td><Link to={`/admin/staff-account/${staff.id}`}><i className="bx bxs-pencil"></i><span>Edit</span></Link></td></tr>)}{!loading && !data?.data?.length && <tr><td colSpan="6">No staff accounts found.</td></tr>}</tbody></table>
            <TablePagination meta={data?.meta} onChange={setPage} />
        </div></div>
    </AdminPage>;
}

export function StaffAccountCreatePage() {
    const [staffId, setStaffId] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data, loading, error, reload } = useAdminLoader(() => adminService.staffIds({ search, page }), [search, page]);
    const submit = useSubmit();
    const create = async (event) => { event.preventDefault(); try { await submit.submit(() => adminService.createStaffId({ staff_id: staffId })); setStaffId(''); reload(); } catch { /* alert below */ } };
    const remove = async () => { try { await submit.submit(() => adminService.deleteStaffId(deleteTarget)); setDeleteTarget(null); reload(); } catch { setDeleteTarget(null); } };
    return <AdminPage className="staff-account-create" title="Create Staff ID"><AdminAlert message={submit.error ? getAdminError(submit.error) : submit.message || error} error={Boolean(submit.error || error)} />
        <AdminHeader title="Create New Staff ID" />
        <div className="form-section"><form onSubmit={create}><div className="create-form"><label>New ID</label><input value={staffId} onChange={(event) => setStaffId(inputValue(event))} placeholder="Enter new staff ID" required /><ErrorText>{getFieldError(submit.error, 'staff_id')}</ErrorText></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Create'} disabled={submit.saving} /><Link to="/admin/staff-account"><span>Cancel</span></Link></div></form></div>
        <div className="bottom-section"><div className="id"><div className="header"><i className="bx bx-id-card"></i><h3>Staff ID Registered</h3><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /></div><table><thead><tr><th>No.</th><th>ID Registered</th><th>Created At</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="4">Loading…</td></tr> : data?.data?.map((account, index) => <tr key={account.id}><td>{index + 1}</td><td>{account.staff_account_id}</td><td>{account.created_at || '—'}</td><td><button type="button" className="delete-button-popup" onClick={() => setDeleteTarget(account.id)}><i className="bx bxs-trash-alt"></i><span>Delete</span></button></td></tr>)}{!loading && !data?.data?.length && <tr><td colSpan="4">No Staff IDs found.</td></tr>}</tbody></table><TablePagination meta={data?.meta} onChange={setPage} /></div></div>
        <DeleteModal open={Boolean(deleteTarget)} message="Are you sure you want to delete this Staff ID?" onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminPage>;
}

export function StaffAccountShowPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, loading, error } = useAdminLoader(() => adminService.staffById(id), [id]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const submit = useSubmit();
    const user = data?.data;
    const remove = async () => { try { await submit.submit(() => adminService.deleteStaff(id)); navigate('/admin/staff-account'); } catch { setDeleteOpen(false); } };
    return <AdminPage className="staff-account-show" title="Staff Details"><AdminAlert message={error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Staff Details"><Link to={`/admin/staff-account/${id}/edit`} className="edit-button"><i className="bx bxs-edit"></i><span>Edit</span></Link></AdminHeader>
        <div className="show-section"><div className="user"><div className="header"><h3>Staff Information</h3></div><div className="user-data"><div className="label"><span>Name</span><span>Staff ID</span><span>Email</span><span>Phone No</span><span>Position</span><span>Address</span></div><div className="data">{['name', 'staff_id', 'email', 'phone', 'position', 'address'].map((field) => <span key={field}>{loading ? 'Loading…' : user?.[field] || '—'}</span>)}</div></div></div><div className="button"><button type="button" className="delete-button-popup" onClick={() => setDeleteOpen(true)}><i className="bx bxs-trash-alt"></i><span>Delete</span></button><Link to="/admin/staff-account"><span>Cancel</span></Link></div></div>
        <DeleteModal open={deleteOpen} message="Are you sure you want to delete this staff?" onCancel={() => setDeleteOpen(false)} onConfirm={remove} />
    </AdminPage>;
}

export function StaffAccountEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, error } = useAdminLoader(() => adminService.staffById(id), [id]);
    const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', address: '', password: '' });
    const submit = useSubmit();
    useEffect(() => { if (data?.data) setForm((current) => ({ ...current, ...data.data })); }, [data]);
    const update = async (event) => { event.preventDefault(); try { await submit.submit(() => adminService.updateStaff(id, form)); navigate(`/admin/staff-account/${id}`); } catch { /* alert below */ } };
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    return <AdminPage className="staff-account-edit" title="Edit Staff Account"><AdminAlert message={error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Edit Staff Account" />
        <div className="edit-section"><div className="user"><div className="header"><h3>Staff Information</h3></div></div><div className="form-staff-update"><form onSubmit={update}><div className="input-section"><div className="label"><span>Staff ID</span><span>Name</span><span>Email</span><span>Phone No</span><span>Position</span><span>Address</span><span>Password</span></div><div className="input"><input value={data?.data?.staff_id || ''} disabled /><input value={form.name} onChange={set('name')} required /><input type="email" value={form.email} onChange={set('email')} required /><input value={form.phone || ''} onChange={set('phone')} /><input value={form.position || ''} onChange={set('position')} /><input value={form.address || ''} onChange={set('address')} /><input type="password" value={form.password || ''} onChange={set('password')} placeholder="Leave blank to keep current" /></div></div><ErrorText>{submit.error && getFieldError(submit.error, 'email')}</ErrorText><div className="button-section"><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Update'} disabled={submit.saving} /><Link to={`/admin/staff-account/${id}`}><span>Cancel</span></Link></div></div></form></div></div>
    </AdminPage>;
}

export function FoodMenuIndexPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, loading, error, reload } = useAdminLoader(() => adminService.foodMenus({ search, page }), [search, page]);
    return <AdminPage className="food-menu-index" title="Food Menu"><AdminAlert message={error} error /><AdminHeader title="Food Menu" createHref="/admin/food-menu/create" createLabel="Create New Food Menu" />
        <div className="top-section"><div className="food-menu"><div className="header"><i className="bx bx-food-menu"></i><h3>Food Menu Details</h3><i className="bx bx-filter"></i><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /></div><table id="CompanyFoodMenuIndex" className="table1"><thead><tr><th><input type="checkbox" /></th><th>Name</th><th>Description</th><th>Price</th><th>Category</th><th>Image</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading…</td></tr> : data?.data?.map((menu) => <tr key={menu.id}><td><input type="checkbox" value={menu.id} /></td><td>{menu.name}</td><td>{menu.description?.slice(0, 30)}{menu.description?.length > 30 ? '…' : ''}</td><td>{formatCurrency(menu.price)}</td><td>{menu.category || '—'}</td><td><AdminImage path={menu.image} alt={menu.name} /></td><td><Link to={`/admin/food-menu/${menu.id}`}><i className="bx bxs-pencil"></i><span>Edit</span></Link></td></tr>)}{!loading && !data?.data?.length && <tr><td colSpan="7">No menu items found.</td></tr>}</tbody></table><TablePagination meta={data?.meta} onChange={setPage} /></div></div>
    </AdminPage>;
}

const emptyFood = { name: '', description: '', price: '', category_id: '' };

export function FoodMenuCreatePage() {
    const [form, setForm] = useState(emptyFood);
    const [file, setFile] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const categories = useAdminLoader(() => adminService.foodCategories({ search: categorySearch, page }), [categorySearch, page]);
    const submit = useSubmit();
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    const saveMenu = async (event) => { event.preventDefault(); const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); if (file) body.append('image', file); try { await submit.submit(() => adminService.createFoodMenu(body)); setForm(emptyFood); setFile(null); } catch { /* alert below */ } };
    const saveCategory = async (event) => { event.preventDefault(); try { await submit.submit(() => adminService.createFoodCategory({ name: categoryName })); setCategoryName(''); categories.reload(); } catch { /* alert below */ } };
    const deleteCategory = async () => { try { await submit.submit(() => adminService.deleteFoodCategory(deleteTarget)); setDeleteTarget(null); categories.reload(); } catch { setDeleteTarget(null); } };
    return <AdminPage className="food-menu-create" title="Create Food Menu"><AdminAlert message={submit.error ? getAdminError(submit.error) : submit.message || categories.error} error={Boolean(submit.error || categories.error)} /><AdminHeader title="Create Food Menu" />
        <div className="top-section"><form onSubmit={saveMenu} encType="multipart/form-data"><div className="form-add-menu"><div className="header"><h4>Food Menu Details</h4></div><span className="star">Food Name</span><input type="text" value={form.name} onChange={set('name')} placeholder="Enter food name" required /><ErrorText>{getFieldError(submit.error, 'name')}</ErrorText><span className="star">Food Description</span><input type="text" value={form.description} onChange={set('description')} placeholder="Enter food description" required /><span className="star">Price</span><input type="number" step="0.01" value={form.price} onChange={set('price')} placeholder="Enter food price" required /><span className="star">Food Category</span><AdminDropdown value={form.category_id} options={categories.data?.data || []} onChange={(value) => setForm((current) => ({ ...current, category_id: value }))} /><ErrorText>{getFieldError(submit.error, 'category_id')}</ErrorText><div className="low"><span>Food Image (Optional)</span></div><AdminUploader file={file} onChange={setFile} /><div className="button-menu"><input type="submit" value={submit.saving ? 'Saving…' : 'Add Menu'} disabled={submit.saving} /><Link to="/admin/food-menu"><span>Cancel</span></Link></div></div></form><form onSubmit={saveCategory}><div className="form-category"><div className="header"><h4>Food Category Details</h4></div><span>Food Category</span><input type="text" value={categoryName} onChange={(event) => setCategoryName(inputValue(event))} placeholder="Enter new food category" required /></div><div className="button-category"><input type="submit" value="Add Category" disabled={submit.saving} /><Link to="/admin/food-menu"><span>Cancel</span></Link></div></form></div>
        <div className="bottom-section"><div className="food-category"><div className="header"><i className="bx bx-category"></i><h3>Food Category</h3><AdminSearch value={categorySearch} onChange={(value) => { setCategorySearch(value); setPage(1); }} onSubmit={categories.reload} /></div><table><thead><tr><th>No.</th><th>Category Name</th><th>Created At</th><th></th></tr></thead><tbody>{categories.loading ? <tr><td colSpan="4">Loading…</td></tr> : categories.data?.data?.map((category, index) => <tr key={category.id}><td>{index + 1}</td><td>{category.name}</td><td>{category.created_at || '—'}</td><td><button type="button" className="delete-button-popup" onClick={() => setDeleteTarget(category.id)}><i className="bx bxs-trash-alt"></i><span>Delete</span></button></td></tr>)}{!categories.loading && !categories.data?.data?.length && <tr><td colSpan="4">No categories found.</td></tr>}</tbody></table><TablePagination meta={categories.data?.meta} onChange={setPage} /></div></div><DeleteModal open={Boolean(deleteTarget)} message="Are you sure you want to delete this Category?" onCancel={() => setDeleteTarget(null)} onConfirm={deleteCategory} />
    </AdminPage>;
}

export function FoodMenuShowPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, loading, error } = useAdminLoader(() => adminService.foodMenuById(id), [id]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const submit = useSubmit();
    const menu = data?.data;
    const remove = async () => { try { await submit.submit(() => adminService.deleteFoodMenu(id)); navigate('/admin/food-menu'); } catch { setDeleteOpen(false); } };
    return <AdminPage className="food-menu-show" title="Food Menu Details"><AdminAlert message={error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Food Menu Details" /><div className="show-section"><div className="container"><div className="image"><AdminImage path={menu?.image} alt={menu?.name} /></div><div className="details"><h2>{loading ? 'Loading…' : menu?.name}</h2><span className="category">{menu?.category || '—'}</span><span className="price">{menu ? formatCurrency(menu.price) : '—'}</span><span className="description">{menu?.description || '—'}</span></div></div></div><div className="button"><Link to={`/admin/food-menu/${id}/edit`}><i className="bx bxs-edit"></i><span>Edit</span></Link><button type="button" className="delete-button-popup" onClick={() => setDeleteOpen(true)}><i className="bx bxs-trash-alt"></i><span>Delete</span></button><Link to="/admin/food-menu"><span>Cancel</span></Link></div><DeleteModal open={deleteOpen} message="Are you sure you want to delete this menu?" onCancel={() => setDeleteOpen(false)} onConfirm={remove} /></AdminPage>;
}

export function FoodMenuEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = useAdminLoader(() => adminService.foodMenuById(id), [id]);
    const categories = useAdminLoader(() => adminService.foodCategories({ per_page: 100 }), []);
    const [form, setForm] = useState(emptyFood);
    const [file, setFile] = useState(null);
    const submit = useSubmit();
    useEffect(() => { if (item.data?.data) setForm({ name: item.data.data.name || '', description: item.data.data.description || '', price: item.data.data.price || '', category_id: item.data.data.category_id || '' }); }, [item.data]);
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    const update = async (event) => { event.preventDefault(); const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); if (file) body.append('image', file); try { await submit.submit(() => adminService.updateFoodMenu(id, body)); navigate(`/admin/food-menu/${id}`); } catch { /* alert below */ } };
    return <AdminPage className="food-menu-edit" title="Edit Food Menu"><AdminAlert message={item.error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Edit Food Menu" /><div className="edit-section"><form onSubmit={update}><div className="container"><AdminUploader file={file} value={item.data?.data?.image} onChange={setFile} /><div className="details"><div className="label"><span>Food Name</span><input value={form.name} onChange={set('name')} required /><span>Food Category</span><AdminDropdown value={form.category_id} options={categories.data?.data || []} onChange={(value) => setForm((current) => ({ ...current, category_id: value }))} /><span>Price</span><input type="number" step="0.01" value={form.price} onChange={set('price')} required /><span>Description</span><input className="description" value={form.description} onChange={set('description')} required /></div></div></div><div className="button-section"><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Update'} disabled={submit.saving} /><Link to={`/admin/food-menu/${id}`}><span>Cancel</span></Link></div></div></form></div></AdminPage>;
}

export function RestaurantIndexPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, loading, error, reload } = useAdminLoader(() => adminService.restaurantItems({ search, page }), [search, page]);
    return <AdminPage className="restaurant-index" title="Restaurant Items"><AdminAlert message={error} error /><AdminHeader title="Restaurant Items" createHref="/admin/restaurant/create" createLabel="Create New Restaurant Item" /><div className="item-section"><div className="container"><div className="header"><i className="bx bx-archive"></i><h3>Items Details</h3><i className="bx bx-filter"></i><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /></div><table><thead><tr><th><input type="checkbox" /></th><th>Item</th><th>Quantity</th><th>Category</th><th>Price/each</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="6">Loading…</td></tr> : data?.data?.map((item) => <tr key={item.id}><td><input type="checkbox" value={item.id} /></td><td>{item.item_name}</td><td>{item.quantity}</td><td>{item.category || '—'}</td><td>{formatCurrency(item.price)}</td><td><Link to={`/admin/restaurant/${item.id}`}><i className="bx bxs-pencil"></i><span>Edit</span></Link></td></tr>)}{!loading && !data?.data?.length && <tr><td colSpan="6">No restaurant items found.</td></tr>}</tbody></table><TablePagination meta={data?.meta} onChange={setPage} /></div></div></AdminPage>;
}

const emptyRestaurant = { item_name: '', quantity: '', category_id: '', item_price: '' };

export function RestaurantCreatePage() {
    const [form, setForm] = useState(emptyRestaurant);
    const [categoryName, setCategoryName] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const categories = useAdminLoader(() => adminService.itemCategories({ search, page }), [search, page]);
    const submit = useSubmit();
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    const createItem = async (event) => { event.preventDefault(); try { await submit.submit(() => adminService.createRestaurantItem(form)); setForm(emptyRestaurant); } catch { /* alert below */ } };
    const createCategory = async (event) => { event.preventDefault(); try { await submit.submit(() => adminService.createItemCategory({ name: categoryName })); setCategoryName(''); categories.reload(); } catch { /* alert below */ } };
    const deleteCategory = async () => { try { await submit.submit(() => adminService.deleteItemCategory(deleteTarget)); setDeleteTarget(null); categories.reload(); } catch { setDeleteTarget(null); } };
    return <AdminPage className="restaurant-create" title="Create Restaurant Item"><AdminAlert message={submit.error ? getAdminError(submit.error) : submit.message || categories.error} error={Boolean(submit.error || categories.error)} /><AdminHeader title="Create New Item" /><div className="form-section"><div className="form-item-create"><form onSubmit={createItem}><div className="header"><h4>Item Details</h4></div><div className="form-input"><span className="star">Item Name</span><input value={form.item_name} onChange={set('item_name')} placeholder="Enter Item Name" required /><span className="star">Quantity</span><input type="number" value={form.quantity} onChange={set('quantity')} placeholder="Enter Product Quantity" required /><span className="star">Category</span><AdminDropdown value={form.category_id} options={categories.data?.data || []} onChange={(value) => setForm((current) => ({ ...current, category_id: value }))} /><span className="star">Item Price/each</span><input type="number" step="0.01" value={form.item_price} onChange={set('item_price')} placeholder="Enter Product Price" required /></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Add Item'} disabled={submit.saving} /><Link to="/admin/restaurant"><span>Cancel</span></Link></div></form></div><div className="form-category-create"><form onSubmit={createCategory}><div className="header"><h4>Item Category</h4></div><div className="form-input"><span>Item Category Name</span><input value={categoryName} onChange={(event) => setCategoryName(inputValue(event))} placeholder="Enter New Item Category" required /></div><div className="button"><input type="submit" value="Add Item Category" disabled={submit.saving} /><Link to="/admin/restaurant"><span>Cancel</span></Link></div></form></div></div><div className="table-section"><div className="item-category"><div className="header"><i className="bx bx-category"></i><h3>Item Category</h3><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={categories.reload} /></div><table><thead><tr><th><input type="checkbox" /></th><th>Category Name</th><th>Created At</th><th></th></tr></thead><tbody>{categories.loading ? <tr><td colSpan="4">Loading…</td></tr> : categories.data?.data?.map((category) => <tr key={category.id}><td><input type="checkbox" /></td><td>{category.name}</td><td>{category.created_at || '—'}</td><td><button type="button" className="delete-button-popup" onClick={() => setDeleteTarget(category.id)}><i className="bx bxs-trash-alt"></i><span>Delete</span></button></td></tr>)}{!categories.loading && !categories.data?.data?.length && <tr><td colSpan="4">No categories found.</td></tr>}</tbody></table><TablePagination meta={categories.data?.meta} onChange={setPage} /></div></div><DeleteModal open={Boolean(deleteTarget)} message="Are you sure you want to delete this Category?" onCancel={() => setDeleteTarget(null)} onConfirm={deleteCategory} /></AdminPage>;
}

export function RestaurantShowPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, loading, error } = useAdminLoader(() => adminService.restaurantItemById(id), [id]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const submit = useSubmit();
    const item = data?.data;
    const remove = async () => { try { await submit.submit(() => adminService.deleteRestaurantItem(id)); navigate('/admin/restaurant'); } catch { setDeleteOpen(false); } };
    return <AdminPage className="restaurant-show" title="Show Restaurant Item"><AdminAlert message={error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Show Restaurant Item" /><div className="show-section"><div className="container"><div className="header"><h3>Item Details</h3></div><div className="details"><div className="label"><span>Item Name</span><span>Quantity</span><span>Item Category</span><span>Item Price/Each</span></div><div className="data"><span>{loading ? 'Loading…' : item?.item_name}</span><span>{item?.quantity || '—'}</span><span>{item?.category || '—'}</span><span>{item ? formatCurrency(item.price) : '—'}</span></div></div></div></div><div className="button"><Link to={`/admin/restaurant/${id}/edit`}><span>Edit</span></Link><button type="button" className="delete-button-popup" onClick={() => setDeleteOpen(true)}>Delete</button><Link to="/admin/restaurant"><span>Cancel</span></Link></div><DeleteModal open={deleteOpen} message="Are you sure you want to delete this item?" onCancel={() => setDeleteOpen(false)} onConfirm={remove} /></AdminPage>;
}

export function RestaurantEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = useAdminLoader(() => adminService.restaurantItemById(id), [id]);
    const categories = useAdminLoader(() => adminService.itemCategories({ per_page: 100 }), []);
    const [form, setForm] = useState(emptyRestaurant);
    const submit = useSubmit();
    useEffect(() => { if (item.data?.data) setForm({ item_name: item.data.data.item_name || '', quantity: item.data.data.quantity || '', category_id: item.data.data.item_category_id || '', item_price: item.data.data.price || '' }); }, [item.data]);
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    const update = async (event) => { event.preventDefault(); try { await submit.submit(() => adminService.updateRestaurantItem(id, form)); navigate(`/admin/restaurant/${id}`); } catch { /* alert below */ } };
    return <AdminPage className="restaurant-edit" title="Edit Restaurant Item"><AdminAlert message={item.error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Edit Restaurant Item" /><form onSubmit={update}><div className="edit-section"><div className="container"><div className="header"><h3>Edit {item.data?.data?.item_name || 'Item'}</h3></div><div className="details"><div className="label"><span>Item Name</span><span>Quantity</span><span>Item Category</span><span>Item Price/Each</span></div><div className="input"><input value={form.item_name} onChange={set('item_name')} required /><input type="number" value={form.quantity} onChange={set('quantity')} required /><AdminDropdown value={form.category_id} options={categories.data?.data || []} onChange={(value) => setForm((current) => ({ ...current, category_id: value }))} /><input type="number" step="0.01" value={form.item_price} onChange={set('item_price')} required /></div></div></div></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Update Item'} disabled={submit.saving} /><Link to={`/admin/restaurant/${id}`}><span>Cancel</span></Link></div></form></AdminPage>;
}

export function PartnershipIndexPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data, loading, error, reload } = useAdminLoader(() => adminService.partnerships({ search, page, per_page: 12 }), [search, page]);
    const submit = useSubmit();
    const remove = async () => { try { await submit.submit(() => adminService.deletePartnership(deleteTarget)); setDeleteTarget(null); reload(); } catch { setDeleteTarget(null); } };
    return <AdminPage className="partnership-index" title="Partnership"><AdminAlert message={error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Partnership" createHref="/admin/partnership/create" createLabel="Add New Partnership" /><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /><div className="bottom-section">{loading ? <div className="container"><p>Loading…</p></div> : data?.data?.map((partner) => <div className="container" key={partner.id}><div className="partner"><div className="display"><AdminImage path={partner.image} alt={partner.company_name} /><div className="name"><h2>{partner.company_name}</h2><div className="details"><div className="label"><span>Owner</span><span>Date Join</span><span>Location</span></div><div className="output"><span>{partner.owner_name}</span><span>{partner.date ? new Date(partner.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'}</span><span>{partner.location}</span></div></div></div></div><div className="action"><Link to={`/admin/partnership/${partner.id}/edit`}><i className="bx bxs-show"></i><span>Edit</span></Link><button type="button" className="delete-button-popup" onClick={() => setDeleteTarget(partner.id)}><i className="bx bxs-trash-alt"></i><span>Remove</span></button></div></div></div>)}{!loading && !data?.data?.length && <div className="container"><p>No partnerships found.</p></div>}</div><TablePagination meta={data?.meta} onChange={setPage} /><DeleteModal open={Boolean(deleteTarget)} message="Are you sure you want to delete this partnership?" onCancel={() => setDeleteTarget(null)} onConfirm={remove} /></AdminPage>;
}

const emptyPartner = { company_name: '', owner_name: '', date: '', location: '' };

export function PartnershipCreatePage() {
    const [form, setForm] = useState(emptyPartner);
    const [file, setFile] = useState(null);
    const submit = useSubmit();
    const navigate = useNavigate();
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    const save = async (event) => { event.preventDefault(); const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); if (file) body.append('image', file); try { await submit.submit(() => adminService.createPartnership(body)); navigate('/admin/partnership'); } catch { /* alert below */ } };
    return <AdminPage className="partnership-create" title="Create Partnership"><AdminAlert message={submit.error && getAdminError(submit.error)} error /><AdminHeader title="Add New Partnership" /><div className="create-section"><form onSubmit={save} encType="multipart/form-data"><div className="container"><AdminUploader file={file} onChange={setFile} required /><div className="details"><div className="label"><span>Company Name</span><input value={form.company_name} onChange={set('company_name')} placeholder="Enter company name" required /><span>Owner Name</span><input value={form.owner_name} onChange={set('owner_name')} placeholder="Enter owner name" required /><span>Date Join</span><input type="date" value={form.date} onChange={set('date')} required /><span>Location</span><input value={form.location} onChange={set('location')} placeholder="Enter location" required /></div></div></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Add Partner'} disabled={submit.saving} /><Link to="/admin/partnership"><span>Cancel</span></Link></div></form></div></AdminPage>;
}

export function PartnershipEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = useAdminLoader(() => adminService.partnershipById(id), [id]);
    const [form, setForm] = useState(emptyPartner);
    const [file, setFile] = useState(null);
    const submit = useSubmit();
    useEffect(() => { if (item.data?.data) setForm({ company_name: item.data.data.company_name || '', owner_name: item.data.data.owner_name || '', date: item.data.data.date || '', location: item.data.data.location || '' }); }, [item.data]);
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    const update = async (event) => { event.preventDefault(); const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); if (file) body.append('image', file); try { await submit.submit(() => adminService.updatePartnership(id, body)); navigate('/admin/partnership'); } catch { /* alert below */ } };
    return <AdminPage className="partnership-edit" title="Edit Partnership"><AdminAlert message={item.error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Edit Partnership" /><div className="edit-section"><form onSubmit={update} encType="multipart/form-data"><div className="container"><AdminUploader file={file} value={item.data?.data?.image} onChange={setFile} /><div className="details"><div className="label"><span>Company Name</span><input value={form.company_name} onChange={set('company_name')} required /><span>Owner Name</span><input value={form.owner_name} onChange={set('owner_name')} required /><span>Date Join</span><input type="date" value={form.date} onChange={set('date')} required /><span>Location</span><input value={form.location} onChange={set('location')} required /></div></div></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Update Partner'} disabled={submit.saving} /><Link to="/admin/partnership"><span>Cancel</span></Link></div></form></div></AdminPage>;
}

export function PromotionDiscountIndexPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, loading, error, reload } = useAdminLoader(() => adminService.promotionDiscounts({ search, page }), [search, page]);
    return <AdminPage className="promotion-discount-index" title="Promotion and Discount"><AdminAlert message={error} error /><AdminHeader title="Promotions and Discounts" createHref="/admin/promotion-discount/create" createLabel="Create New Discount Coupon" /><div className="index-section"><div className="container"><div className="header"><i className="bx bx-purchase-tag"></i><h3>Coupons</h3><i className="bx bx-filter"></i><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={reload} /></div><table><thead><tr><th><input type="checkbox" /></th><th>Coupon ID</th><th>QR Code</th><th>Coupon Name</th><th>Discount</th><th>Status</th><th>Event</th><th>Validity</th><th>Date Redeemed</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="10">Loading…</td></tr> : data?.data?.map((coupon) => <tr key={coupon.id}><td><input type="checkbox" value={coupon.id} /></td><td>{coupon.coupon_code?.slice(0, 5)}</td><td><div className="qrcode" aria-label={`QR code ${coupon.coupon_code}`} dangerouslySetInnerHTML={{ __html: coupon.qr_code || '' }}></div></td><td>{coupon.coupon_name}</td><td>{Number(coupon.discount) * 100}%</td><td><span className={`status ${String(coupon.status).toLowerCase().replace(' ', '-')}`}>{coupon.status}</span></td><td>{coupon.event || '—'}</td><td>{coupon.validity ? new Date(coupon.validity).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—'}</td><td>{coupon.date_redeemed || '—'}</td><td><Link to={`/admin/promotion-discount/${coupon.id}`}><i className="bx bxs-pencil"></i><span>Edit</span></Link></td></tr>)}{!loading && !data?.data?.length && <tr><td colSpan="10">No coupons found.</td></tr>}</tbody></table><TablePagination meta={data?.meta} onChange={setPage} /></div></div></AdminPage>;
}

const emptyCoupon = { coupon_name: '', discount: '', event_id: '', validity: '' };

export function PromotionDiscountCreatePage() {
    const [coupon, setCoupon] = useState(emptyCoupon);
    const [event, setEvent] = useState({ event_name: '', event_date: '' });
    const [eventFile, setEventFile] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const events = useAdminLoader(() => adminService.promotionEvents({ search, page }), [search, page]);
    const submit = useSubmit();
    const setCouponValue = (field) => (e) => setCoupon((current) => ({ ...current, [field]: inputValue(e) }));
    const setEventValue = (field) => (e) => setEvent((current) => ({ ...current, [field]: inputValue(e) }));
    const createCoupon = async (e) => { e.preventDefault(); try { await submit.submit(() => adminService.createPromotionDiscount(coupon)); setCoupon(emptyCoupon); } catch { /* alert below */ } };
    const createEvent = async (e) => { e.preventDefault(); const body = new FormData(); Object.entries(event).forEach(([key, value]) => body.append(key, value)); if (eventFile) body.append('image', eventFile); try { await submit.submit(() => adminService.createPromotionEvent(body)); setEvent({ event_name: '', event_date: '' }); setEventFile(null); events.reload(); } catch { /* alert below */ } };
    const deleteEvent = async () => { try { await submit.submit(() => adminService.deletePromotionEvent(deleteTarget)); setDeleteTarget(null); events.reload(); } catch { setDeleteTarget(null); } };
    return <AdminPage className="promotion-discount-create" title="Create Promotion & Discount"><AdminAlert message={submit.error ? getAdminError(submit.error) : submit.message || events.error} error={Boolean(submit.error || events.error)} /><AdminHeader title="Create Promotion & Discount" /><div className="form-section"><div className="form-promotion-create"><form onSubmit={createCoupon}><div className="header"><h4>Coupon Details</h4></div><div className="form-input"><span className="star">Coupon Name</span><input value={coupon.coupon_name} onChange={setCouponValue('coupon_name')} placeholder="Enter Coupon Name" required /><span className="star">Discount</span><input type="number" step="0.01" min="0.01" max="1" value={coupon.discount} onChange={setCouponValue('discount')} placeholder="e.g. 0.5 = 50%" required /><span>Validity</span><input type="datetime-local" value={coupon.validity} onChange={setCouponValue('validity')} required /><span>Event</span><AdminDropdown value={coupon.event_id} options={(events.data?.data || []).map((item) => ({ id: item.id, name: item.event_name }))} onChange={(value) => setCoupon((current) => ({ ...current, event_id: value }))} /></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Create Coupon'} disabled={submit.saving} /><Link to="/admin/promotion-discount"><span>Cancel</span></Link></div></form></div><div className="form-event-create"><form onSubmit={createEvent} encType="multipart/form-data"><div className="header"><h4>Event Details</h4></div><div className="form-input"><span>Event Name</span><input value={event.event_name} onChange={setEventValue('event_name')} placeholder="Enter Event Name" required /><span>Event Date</span><input type="date" value={event.event_date} onChange={setEventValue('event_date')} required /><AdminUploader file={eventFile} onChange={setEventFile} required /></div><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Add Event'} disabled={submit.saving} /><Link to="/admin/promotion-discount"><span>Cancel</span></Link></div></form></div></div><div className="table-section"><div className="table-event"><div className="header"><i className="bx bx-party"></i><h3>Events</h3><i className="bx bx-filter"></i><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} onSubmit={events.reload} /></div><table><thead><tr><th><input type="checkbox" /></th><th>Event Name</th><th>Date</th><th>Event Image</th><th></th></tr></thead><tbody>{events.loading ? <tr><td colSpan="5">Loading…</td></tr> : events.data?.data?.map((item) => <tr key={item.id}><td><input type="checkbox" /></td><td>{item.event_name}</td><td>{item.event_date}</td><td><AdminImage path={item.image} alt={item.event_name} /></td><td><button type="button" className="delete-button-popup" onClick={() => setDeleteTarget(item.id)}><i className="bx bxs-trash-alt"></i><span>Delete</span></button></td></tr>)}{!events.loading && !events.data?.data?.length && <tr><td colSpan="5">No events found.</td></tr>}</tbody></table><TablePagination meta={events.data?.meta} onChange={setPage} /></div></div><DeleteModal open={Boolean(deleteTarget)} message="Are you sure you want to delete this Event?" onCancel={() => setDeleteTarget(null)} onConfirm={deleteEvent} /></AdminPage>;
}

export function PromotionDiscountShowPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = useAdminLoader(() => adminService.promotionDiscountById(id), [id]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const submit = useSubmit();
    const coupon = item.data?.data;
    const remove = async () => { try { await submit.submit(() => adminService.deletePromotionDiscount(id)); navigate('/admin/promotion-discount'); } catch { setDeleteOpen(false); } };
    return <AdminPage className="promotion-discount-show" title="Show Coupon"><AdminAlert message={item.error || (submit.error && getAdminError(submit.error))} error /><div className="head"><div className="left"><h1>Show Coupon</h1></div></div><div className="show-section"><div className="coupon-design-section"><h4>This is how the coupon design looks like</h4><div className="design"><div className="left-side"><div className="triangle"></div><div className="code"><div className="qrcode" dangerouslySetInnerHTML={{ __html: coupon?.qr_code || '' }}></div></div><span>{coupon?.coupon_code || '—'}</span></div><div className="right-side"><div className="triangle"></div><span className="title">Promotion Discount</span><span className="coupon-name">{coupon?.coupon_name || '—'}</span><span><strong>{coupon ? Number(coupon.discount) * 100 : 0}% OFF</strong></span><span className="valid">Valid until {coupon?.validity ? new Date(coupon.validity).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) : '—'}</span></div></div></div></div><div className="button"><Link to={`/admin/promotion-discount/${id}/edit`}><span>Edit</span></Link><button type="button" className="delete-button-popup" onClick={() => setDeleteOpen(true)}>Delete</button><Link to="/admin/promotion-discount"><span>Cancel</span></Link></div><DeleteModal open={deleteOpen} message="Are you sure you want to delete this coupon?" onCancel={() => setDeleteOpen(false)} onConfirm={remove} /></AdminPage>;
}

export function PromotionDiscountEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = useAdminLoader(() => adminService.promotionDiscountById(id), [id]);
    const events = useAdminLoader(() => adminService.promotionEvents({ per_page: 100 }), []);
    const [form, setForm] = useState({ coupon_name: '', discount: '', redeem_status: '', event_id: '', validity: '' });
    const submit = useSubmit();
    useEffect(() => { if (item.data?.data) setForm({ coupon_name: item.data.data.coupon_name || '', discount: item.data.data.discount || '', redeem_status: item.data.data.status || '', event_id: item.data.data.event_id || '', validity: item.data.data.validity?.slice(0, 16) || '' }); }, [item.data]);
    const set = (field) => (event) => setForm((current) => ({ ...current, [field]: inputValue(event) }));
    const update = async (event) => { event.preventDefault(); try { await submit.submit(() => adminService.updatePromotionDiscount(id, form)); navigate(`/admin/promotion-discount/${id}`); } catch { /* alert below */ } };
    return <AdminPage className="promotion-discount-edit" title="Edit Coupon"><AdminAlert message={item.error || (submit.error && getAdminError(submit.error))} error /><AdminHeader title="Edit Coupon" /><div className="edit-section"><form onSubmit={update}><div className="container"><div className="header"><h3>Edit Coupon {item.data?.data?.coupon_name || ''}</h3></div><div className="details"><div className="data"><span>Coupon Name</span><input value={form.coupon_name} onChange={set('coupon_name')} required /><span>Discount</span><input type="number" step="0.01" min="0.01" max="1" value={form.discount} onChange={set('discount')} required /><span>Redeem Status</span><input value={form.redeem_status} onChange={set('redeem_status')} /><span>Event</span><AdminDropdown value={form.event_id} options={(events.data?.data || []).map((item) => ({ id: item.id, name: item.event_name }))} onChange={(value) => setForm((current) => ({ ...current, event_id: value }))} /><span>Validity Date</span><input type="datetime-local" value={form.validity} onChange={set('validity')} required /></div></div></div><div className="button-section"><div className="button"><input type="submit" value={submit.saving ? 'Saving…' : 'Update Coupon'} disabled={submit.saving} /><Link to={`/admin/promotion-discount/${id}`}><span>Cancel</span></Link></div></div></form></div></AdminPage>;
}

export function AdminProfilePage() {
    const { data, loading, error, reload } = useAdminLoader(() => adminService.profile());
    const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
    const [password, setPassword] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const profileSubmit = useSubmit();
    const passwordSubmit = useSubmit();
    useEffect(() => { if (data?.data) setProfile({ name: data.data.name || '', email: data.data.email || '', phone: data.data.phone || '' }); }, [data]);
    const setProfileValue = (field) => (event) => setProfile((current) => ({ ...current, [field]: inputValue(event) }));
    const setPasswordValue = (field) => (event) => setPassword((current) => ({ ...current, [field]: inputValue(event) }));
    const updateProfile = async (event) => { event.preventDefault(); try { await profileSubmit.submit(() => adminService.updateProfile(profile)); reload(); } catch { /* alert below */ } };
    const updatePassword = async (event) => { event.preventDefault(); try { await passwordSubmit.submit(() => adminService.updatePassword(password)); setPassword({ current_password: '', new_password: '', new_password_confirmation: '' }); } catch { /* alert below */ } };
    return <AdminPage className="admin-profile-edit" title="Profile Settings"><AdminAlert message={error || (profileSubmit.error && getAdminError(profileSubmit.error)) || (passwordSubmit.error && getAdminError(passwordSubmit.error)) || profileSubmit.message || passwordSubmit.message} error={Boolean(error || profileSubmit.error || passwordSubmit.error)} /><AdminHeader title="Profile Settings" /><div className="profile-section"><form onSubmit={updateProfile}><div className="container"><div className="details"><h3>Update Profile</h3><span className="text">Update your account's profile information.</span><span>Name</span><input type="text" value={loading ? '' : profile.name} onChange={setProfileValue('name')} placeholder={loading ? 'Loading…' : profile.name} required /><ErrorText>{getFieldError(profileSubmit.error, 'name')}</ErrorText><span>Email</span><input type="email" value={profile.email} onChange={setProfileValue('email')} placeholder={profile.email} required /><ErrorText>{getFieldError(profileSubmit.error, 'email')}</ErrorText><span>Phone Number</span><input type="text" value={profile.phone || ''} onChange={setProfileValue('phone')} placeholder={profile.phone || ''} /><input type="submit" value={profileSubmit.saving ? 'Saving…' : 'Submit'} disabled={profileSubmit.saving} /></div></div></form><form onSubmit={updatePassword}><div className="container"><div className="password-details"><h3>Update Password</h3><span className="text">Ensure your account is using a long, random password to stay secure.</span><span>Current Password</span><input type="password" value={password.current_password} onChange={setPasswordValue('current_password')} required /><ErrorText>{getFieldError(passwordSubmit.error, 'current_password')}</ErrorText><span>New Password</span><input type="password" value={password.new_password} onChange={setPasswordValue('new_password')} required /><ErrorText>{getFieldError(passwordSubmit.error, 'new_password')}</ErrorText><span>Confirm Password</span><input type="password" value={password.new_password_confirmation} onChange={setPasswordValue('new_password_confirmation')} required /><ErrorText>{getFieldError(passwordSubmit.error, 'new_password_confirmation')}</ErrorText><input type="submit" value={passwordSubmit.saving ? 'Saving…' : 'Submit'} disabled={passwordSubmit.saving} /></div></div></form></div></AdminPage>;
}
