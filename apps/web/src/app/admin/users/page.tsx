"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Mail, UserCheck, X } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";

const ROLE_LABELS: Record<string, string> = { user: "User", mentor: "Mentor", admin: "Admin", redaksi: "Redaksi", superadmin: "Superadmin" };

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "user" });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) { const { data } = await res.json(); setUsers(data || []); }
    } catch (e) { console.error("Failed to load users", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  async function createUser() {
    if (!form.email || !form.password || !form.full_name) return;
    setSaving(true);
    try {
      await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setShowAdd(false);
      setForm({ email: "", password: "", full_name: "", role: "user" });
      await fetchUsers();
    } catch (e) { console.error("Create user failed", e); } finally { setSaving(false); }
  }

  async function updateRole(id: string, newRole: string, email: string) {
    if (!confirm(`Ubah role ${email} jadi ${newRole}?${newRole === 'superadmin' ? ' Role ini punya akses penuh ke seluruh sistem.' : ''}`)) return;
    try { await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) }); await fetchUsers(); } catch (e) { console.error("Update role failed", e); }
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Hapus user ${email}?\nAksi ini permanen!`)) return;
    try { await fetch(`/api/admin/users/${id}`, { method: "DELETE" }); await fetchUsers(); } catch (e) { console.error("Delete user failed", e); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Users</h1>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari email atau nama..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400">
          <option value="">Semua Role</option>
          {Object.entries(ROLE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <Button variant="accent" size="sm" onClick={() => setShowAdd(true)} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah User</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {users.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Tidak ada user</p>}
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xs font-bold text-amber-700">{(u.full_name || u.email)[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 truncate">{u.full_name || "—"}</span>
                  <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value, u.email)}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer">
                    {Object.entries(ROLE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                  {u.status === "suspended" && <Badge variant="warning" className="text-[9px]">Suspended</Badge>}
                  {u.status === "banned" && <Badge variant="destructive" className="text-[9px]">Banned</Badge>}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                  <Mail className="w-3 h-3" /><span>{u.email}</span><span>•</span><span>{new Date(u.created_at).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
              <button onClick={() => deleteUser(u.id, u.email)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0 cursor-pointer"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Tambah User</h3>
              <button onClick={() => setShowAdd(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Password</label><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Nama Lengkap</label><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {Object.entries(ROLE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setShowAdd(false)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={createUser} disabled={saving || !form.email || !form.password || !form.full_name}>
                <UserCheck className="w-4 h-4" /> {saving ? "Menyimpan..." : "Buat User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
