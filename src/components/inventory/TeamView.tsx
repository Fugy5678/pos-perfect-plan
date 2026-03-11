import { useState, useEffect } from 'react';
import { UserPlus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';

interface TeamUser {
    id: number;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';
    isActive: boolean;
    createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
    AGENT: 'bg-green-100 text-green-700 border-green-200',
};

const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    AGENT: 'Agent',
};

export function TeamView() {
    const { user: currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const [users, setUsers] = useState<TeamUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'ADMIN' | 'AGENT'>('AGENT');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchWithAuth('/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toast.error('Failed to load team: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newPassword) {
            toast.error('Name and password are required');
            return;
        }
        setIsSubmitting(true);
        try {
            // For agents: email is auto-generated (name@jvnpos.local). For admins email is optional.
            const email = newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@jvnpos.local`;
            await fetchWithAuth('/users', {
                method: 'POST',
                body: JSON.stringify({ name: newName, email, password: newPassword, role: newRole }),
            });
            toast.success(`${ROLE_LABELS[newRole]} "${newName}" created successfully!`);
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            setNewRole('AGENT');
            setShowForm(false);
            loadUsers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (u: TeamUser) => {
        try {
            await fetchWithAuth(`/users/${u.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !u.isActive }),
            });
            toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`);
            loadUsers();
        } catch (err: any) {
            toast.error(err.message || 'Update failed');
        }
    };

    const handleResetPassword = async (u: TeamUser) => {
        // Permission rules: Super Admin can reset anyone. Admin can only reset Agents and themselves.
        if (currentUser?.role === 'ADMIN' && u.role === 'ADMIN') {
            toast.error('Admins can only reset passwords for Agents or their own account.');
            return;
        }
        const newPw = prompt(`Set new password for ${u.name}:`);
        if (!newPw) return;
        try {
            await fetchWithAuth(`/users/${u.id}`, {
                method: 'PUT',
                body: JSON.stringify({ password: newPw }),
            });
            toast.success(`Password updated for ${u.name}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password');
        }
    };

    const grouped = {
        SUPER_ADMIN: users.filter((u) => u.role === 'SUPER_ADMIN'),
        ADMIN: users.filter((u) => u.role === 'ADMIN'),
        AGENT: users.filter((u) => u.role === 'AGENT'),
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold">Team Management</h2>
                    <p className="text-xs text-muted-foreground">{users.length} account{users.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-[12px] text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                    <UserPlus className="w-3.5 h-3.5" />
                    {showForm ? 'Cancel' : 'Add User'}
                </button>
            </div>

            {/* Create User Form */}
            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="border border-border rounded-[16px] p-4 bg-muted/30 space-y-3"
                >
                    <h3 className="text-sm font-bold">Create New Account</h3>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="border border-border rounded-[12px] p-2.5 bg-card col-span-2">
                            <label className="block text-[11px] text-muted-foreground mb-1">Name / Username *</label>
                            <input
                                type="text"
                                placeholder="e.g. John"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                                className="w-full border-none outline-none text-sm bg-transparent"
                            />
                        </div>

                        <div className="border border-border rounded-[12px] p-2.5 bg-card">
                            <label className="block text-[11px] text-muted-foreground mb-1">Password *</label>
                            <input
                                type="text"
                                placeholder="Set password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full border-none outline-none text-sm bg-transparent"
                            />
                        </div>

                        <div className="border border-border rounded-[12px] p-2.5 bg-card">
                            <label className="block text-[11px] text-muted-foreground mb-1">Role *</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'AGENT')}
                                className="w-full border-none outline-none text-sm bg-transparent"
                            >
                                <option value="AGENT">Agent</option>
                                {isSuperAdmin && <option value="ADMIN">Admin</option>}
                            </select>
                        </div>

                        {/* Email optional — only for admins (agents use auto-generated) */}
                        {newRole === 'ADMIN' && (
                            <div className="border border-border rounded-[12px] p-2.5 bg-card col-span-2">
                                <label className="block text-[11px] text-muted-foreground mb-1">Email (optional for Admin)</label>
                                <input
                                    type="email"
                                    placeholder="admin@email.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full border-none outline-none text-sm bg-transparent"
                                />
                            </div>
                        )}
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                        {newRole === 'AGENT'
                            ? '💡 Agents log in with their name + password. They can only see their own sales.'
                            : '💡 Admins log in with their name or email + password. They have full access.'}
                    </p>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground rounded-[12px] py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                        {isSubmitting ? 'Creating...' : `Create ${ROLE_LABELS[newRole]}`}
                    </button>
                </form>
            )}

            {/* User List grouped by role */}
            {isLoading ? (
                <div className="text-center text-sm text-muted-foreground py-8">Loading team...</div>
            ) : (
                ['ADMIN', 'AGENT', 'SUPER_ADMIN'].map((roleKey) => {
                    const group = grouped[roleKey as keyof typeof grouped];
                    if (group.length === 0) return null;
                    return (
                        <div key={roleKey}>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                {ROLE_LABELS[roleKey]}s ({group.length})
                            </p>
                            <div className="space-y-2">
                                {group.map((u) => (
                                    <div
                                        key={u.id}
                                        className={`flex items-center justify-between border border-border rounded-[14px] px-3 py-2.5 bg-card ${!u.isActive ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full shrink-0 ${ROLE_COLORS[u.role]}`}>
                                                {u.role === 'SUPER_ADMIN' ? 'SA' : u.role === 'ADMIN' ? 'ADM' : 'AGT'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{u.name}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">{u.email.includes('@jvnpos.local') ? 'username login' : u.email}</p>
                                            </div>
                                        </div>
                                        {/* Show actions based on role permissions */}
                                        {u.id !== currentUser?.id && u.role !== 'SUPER_ADMIN' && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                {/* Reset password: Admins can only reset Agents; Super Admins can reset anyone */}
                                                {(isSuperAdmin || u.role === 'AGENT') && (
                                                    <button
                                                        onClick={() => handleResetPassword(u)}
                                                        title="Reset password"
                                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleToggleActive(u)}
                                                    title={u.isActive ? 'Deactivate' : 'Activate'}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                >
                                                    {u.isActive
                                                        ? <ToggleRight className="w-4 h-4 text-primary" />
                                                        : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
