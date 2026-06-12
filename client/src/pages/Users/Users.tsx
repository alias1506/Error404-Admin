import React, { useEffect, useState, useCallback } from "react";
import { CustomSwal as Swal } from "../../components/ui/swal/swal";

const API_URL = import.meta.env.VITE_API_URL || "";

import { SwalToast } from "../../components/ui/toast/toast";
import { Modal } from "../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Select from "../../components/form/Select";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Pagination from "../../components/common/Pagination";
import Checkbox from "../../components/form/input/Checkbox";
import Loader from "../../components/common/Loader";
interface User {
  _id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  role: string;
  lastLogin: string;
  createdAt: string;
  warnings: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to refresh users:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleNumberInput = (field: keyof User, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setEditForm({ ...editForm, [field]: numericValue === "" ? 0 : Number(numericValue) });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      warnings: user.warnings,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete ${user.username}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/users/${user._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setUsers((prev) => prev.filter(u => u._id !== user._id));
          setTimeout(() => SwalToast.fire({ icon: 'success', title: 'User deleted successfully' }), 300);
        } else {
          SwalToast.fire({ icon: 'error', title: 'Failed to delete user' });
        }
      } catch (error) {
        SwalToast.fire({ icon: 'error', title: 'Server error' });
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        SwalToast.fire({ icon: 'success', title: 'User updated successfully' });
        setIsEditModalOpen(false);
      } else {
        SwalToast.fire({ icon: 'error', title: 'Failed to update user' });
      }
    } catch (error) {
      SwalToast.fire({ icon: 'error', title: 'Server error' });
    }
  };

  const filteredUsers = users.filter((user) => 
    user.username?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentUsers.map(u => u._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete ${selectedIds.length} users? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/users/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (response.ok) {
          setUsers((prev) => prev.filter(u => !selectedIds.includes(u._id)));
          setSelectedIds([]);
          setTimeout(() => SwalToast.fire({ icon: 'success', title: 'Users deleted successfully' }), 300);
        } else {
          SwalToast.fire({ icon: 'error', title: 'Failed to delete users' });
        }
      } catch (error) {
        SwalToast.fire({ icon: 'error', title: 'Server error' });
      }
    }
  };

  return (
    <>
      <PageMeta
        title="Users | Admin Dashboard"
        description="View and manage all registered users in real-time."
      />
      <PageBreadcrumb pageTitle="Users" />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-1/2 md:w-1/3">
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-white/5 dark:text-white/90 dark:focus:border-brand-500 transition-colors"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-[140px]">
            <Select 
              options={[
                { value: "5", label: "5 per page" },
                { value: "10", label: "10 per page" },
                { value: "20", label: "20 per page" },
                { value: "50", label: "50 per page" }
              ]}
              defaultValue={itemsPerPage.toString()}
              onChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}
              className="!h-10 !py-1.5 !bg-transparent dark:!bg-white/5 !border-gray-200 dark:!border-gray-800 !shadow-none"
            />
          </div>

          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete ({selectedIds.length})
            </button>
          )}

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors w-full sm:w-auto justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* Users Table */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-gray-900/60 rounded-xl">
              <Loader text="Loading users..." />
            </div>
          )}
          <div className={`max-w-full overflow-x-auto ${loading ? 'opacity-40 pointer-events-none' : ''}`}>
            <Table className="table-fixed">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={currentUsers.length > 0 && selectedIds.length === currentUsers.length}
                        onChange={handleSelectAll}
                      />
                      <span>#</span>
                    </div>
                  </TableCell>
                  <TableCell isHeader className="w-[25%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    User Info
                  </TableCell>
                  <TableCell isHeader className="w-[15%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Level
                  </TableCell>
                  <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    XP
                  </TableCell>
                  <TableCell isHeader className="w-[15%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Streak
                  </TableCell>
                  <TableCell isHeader className="w-[20%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Last Login
                  </TableCell>
                  <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {!loading && filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 text-center text-gray-500 dark:text-gray-400 h-[350px]" colSpan={8}>
                      <div className="flex flex-col items-center justify-center h-full">
                        <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No users found</p>
                        <p className="text-sm">Try adjusting your search or add a new user.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user, index) => (
                    <TableRow key={user._id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <Checkbox 
                            checked={selectedIds.includes(user._id)}
                            onChange={() => handleSelectOne(user._id)}
                          />
                          <span>{(currentPage - 1) * itemsPerPage + index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-semibold text-lg">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {user.username}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400 mt-0.5">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm">
                        <div className="flex flex-col gap-1.5 items-start">
                          {user.warnings >= 3 ? (
                            <Badge color="error">Disqualified</Badge>
                          ) : (
                            <Badge color="success">Active</Badge>
                          )}
                          {user.warnings > 0 && user.warnings < 3 && (
                            <Badge color="warning">{user.warnings}/3 Warnings</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-800 dark:text-white/90">{user.level || 1}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                        {user.xp || 0} XP
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm">
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 font-medium border border-orange-200 dark:border-orange-500/20">
                          🔥 {user.streak || 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleView(user)} className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors" title="View User">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button onClick={() => handleEdit(user)} className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors" title="Edit User">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button onClick={() => handleDelete(user)} className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400 transition-colors" title="Delete User">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} className="max-w-[440px] p-0 overflow-hidden !rounded-[36px]">
        {selectedUser && (
          <div>
            <div className="bg-gradient-to-br from-brand-500/20 to-brand-500/5 dark:from-brand-500/10 dark:to-transparent p-10 flex flex-col items-center justify-center relative">
              <div className="w-24 h-24 bg-brand-500 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-5 shadow-xl shadow-brand-500/30 border-4 border-white dark:border-gray-800">
                {selectedUser.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.username}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">{selectedUser.email}</p>
              <div className="absolute top-6 left-6">
                 <Badge color={selectedUser.role === "admin" ? "success" : "primary"}>{selectedUser.role || 'user'}</Badge>
              </div>
            </div>
            
            <div className="p-8 pt-2">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50/50 dark:bg-white/5 rounded-3xl p-5 flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Level</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.level || 1}</span>
                </div>
                <div className="bg-brand-50/50 dark:bg-brand-500/5 rounded-3xl p-5 flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                  <span className="text-brand-500/60 dark:text-brand-500/60 text-[10px] font-bold uppercase tracking-widest mb-2">XP</span>
                  <span className="text-2xl font-bold text-brand-500">{selectedUser.xp || 0}</span>
                </div>
                <div className="bg-orange-50/50 dark:bg-orange-500/5 rounded-3xl p-5 flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                  <span className="text-orange-500/60 dark:text-orange-500/60 text-[10px] font-bold uppercase tracking-widest mb-2">Streak</span>
                  <span className="text-2xl font-bold text-orange-500">🔥 {selectedUser.streak || 0}</span>
                </div>
              </div>

              <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 mb-6 flex justify-between items-center">
                <span className="text-gray-400 dark:text-gray-500 font-medium text-sm">Account Status</span>
                <div className="flex gap-2 items-center">
                  {selectedUser.warnings >= 3 ? (
                    <Badge color="error">Disqualified</Badge>
                  ) : (
                    <Badge color="success">Active</Badge>
                  )}
                  {selectedUser.warnings > 0 && selectedUser.warnings < 3 && (
                    <Badge color="warning">{selectedUser.warnings}/3 Warnings</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-sm px-2">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">User ID</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-300 font-mono text-xs bg-gray-50 dark:bg-black/20 px-3 py-1.5 rounded-xl">{selectedUser._id}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Last Login</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-300">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Joined Date</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-300">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-[460px] p-8 !rounded-[36px]">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Update details & progress.</p>
          </div>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 pl-1">Username</label>
              <input type="text" required value={editForm.username || ''} onChange={(e) => setEditForm({...editForm, username: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/5 dark:text-white transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 pl-1">Email Address</label>
              <input type="email" required value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/5 dark:text-white transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 text-center">Level</label>
              <input type="text" inputMode="numeric" required value={editForm.level || ''} onChange={(e) => handleNumberInput('level', e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/5 dark:text-white transition-all text-center font-bold text-lg" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-brand-500/70 uppercase tracking-widest mb-2 text-center">XP</label>
              <input type="text" inputMode="numeric" required value={editForm.xp || ''} onChange={(e) => handleNumberInput('xp', e.target.value)} className="w-full px-4 py-3.5 bg-brand-50/50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-brand-500/10 dark:text-brand-500 font-bold transition-all text-center text-lg" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-orange-500/70 uppercase tracking-widest mb-2 text-center">Streak</label>
              <input type="text" inputMode="numeric" required value={editForm.streak || ''} onChange={(e) => handleNumberInput('streak', e.target.value)} className="w-full px-4 py-3.5 bg-orange-50/50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 dark:bg-orange-500/10 dark:text-orange-500 transition-all text-center font-bold text-lg" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-red-500/70 uppercase tracking-widest mb-2 pl-1">Warnings / Infractions</label>
            <input type="text" inputMode="numeric" required value={editForm.warnings !== undefined ? editForm.warnings : ''} onChange={(e) => handleNumberInput('warnings', e.target.value)} className="w-full px-5 py-3.5 bg-red-50/50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/50 dark:bg-red-500/10 dark:text-red-500 transition-all font-bold" />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 ml-1">Setting this to 3 or higher will instantly disqualify the user.</p>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-3 text-sm font-bold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 shadow-xl shadow-brand-500/20 transition-all">Save Changes</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
