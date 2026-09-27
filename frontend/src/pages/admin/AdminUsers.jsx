import { useState, useEffect, useMemo } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    getPaginationRowModel, 
    getFilteredRowModel,
    flexRender 
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, UserPlus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import SkeletonCard from '../../components/SkeletonCard';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', full_name: '', role: 'user'
    });
    const [formError, setFormError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({ full_name: '', role: 'user', is_active: true });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            toast.error('Error al cargar usuarios');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openEditForm = (user) => {
        setEditingUser(user);
        setEditData({
            full_name: user.full_name || '',
            role: user.role || 'user',
            is_active: !!user.is_active
        });
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`¿Seguro que deseas eliminar al usuario "${user.username}"?`)) return;
        try {
            await api.delete(`/admin/users/${user.id}`);
            toast.success('Usuario eliminado');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar usuario');
        }
    };

    // Definir columnas
    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: info => <span className="font-mono text-xs text-gray-500">#{info.getValue()}</span>,
        },
        {
            accessorKey: 'username',
            header: 'Usuario',
            cell: info => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {info.getValue().charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700">{info.getValue()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Correo',
            cell: info => <span className="text-gray-600">{info.getValue()}</span>,
        },
        {
            accessorKey: 'role',
            header: 'Rol',
            cell: info => {
                const role = info.getValue();
                const colors = { admin: 'bg-sky-100 text-neutral-900', editor: 'bg-sky-100 text-neutral-800', user: 'bg-gray-100 text-gray-700' };
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || colors.user}`}>{role}</span>;
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Registro',
            cell: info => new Date(info.getValue()).toLocaleDateString('es-ES'),
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openEditForm(row.original)}
                        className="p-1 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                        title="Editar"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original)}
                        className="p-1 text-neutral-800 hover:bg-sky-50 rounded-lg transition"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ], [handleDelete, openEditForm]);

    const table = useReactTable({
        data: users,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 5 } },
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${editingUser.id}`, editData);
            toast.success('✅ Usuario actualizado');
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar usuario');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            await api.post('/auth/admin/register', formData);
            toast.success('✅ Usuario creado exitosamente');
            setShowForm(false);
            setFormData({ username: '', email: '', password: '', full_name: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.error || 'Error al crear usuario';
            setFormError(msg);
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">👥 Gestión de Usuarios</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                    <UserPlus size={18} /> Nuevo Usuario
                </button>
            </div>

            {/* Búsqueda */}
            <div className="relative max-w-sm mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar usuarios..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                        Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
                        {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getRowCount())} de {table.getRowCount()}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-100 transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-100 transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de edición */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Editar: {editingUser.username}</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input
                                name="full_name"
                                placeholder="Nombre completo"
                                value={editData.full_name}
                                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <select
                                name="role"
                                value={editData.role}
                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="user">Usuario</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={editData.is_active}
                                    onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                                />
                                Cuenta activa
                            </label>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de creación (simplificado, mantén tu lógica) */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Crear Usuario</h2>
                        {formError && <div className="bg-sky-50 text-neutral-800 p-2 rounded-lg text-sm mb-4">{formError}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="username" placeholder="Usuario" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                            <input name="password" type="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                            <input name="full_name" placeholder="Nombre completo" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                                <option value="user">Usuario</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;