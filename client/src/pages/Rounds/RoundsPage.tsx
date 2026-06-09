import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/form/Select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SwalToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#18181b',
  color: '#ffffff',
  willOpen: (popup) => {
    const container = popup.parentElement as HTMLElement;
    if (container) container.style.zIndex = '99999';
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

type Round = {
  id: string;
  name: string;
  duration: number;
  status: "Upcoming" | "Active" | "Completed";
  remainingSeconds?: number;
};

export default function RoundsPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRounds((prevRounds) => {
        let hasChanges = false;
        const updated = prevRounds.map(r => {
          if (r.status === "Active" && r.remainingSeconds !== undefined && r.remainingSeconds > 0) {
            hasChanges = true;
            const newRemaining = r.remainingSeconds - 1;
            if (newRemaining <= 0) {
              fetch(`${API_URL}/api/rounds/${r.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "Completed" }),
              });
              SwalToast.fire({ icon: 'success', title: `Round '${r.name}' completed!` });
              return { ...r, status: "Completed" as const, remainingSeconds: 0 };
            }
            return { ...r, remainingSeconds: newRemaining };
          }
          return r;
        });
        return hasChanges ? updated : prevRounds;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchRounds = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rounds`);
      if (response.ok) {
        const data = await response.json();
        const formattedRounds = data.map((r: any) => ({
          id: r._id,
          name: r.name,
          duration: r.duration,
          status: r.status,
          remainingSeconds: r.status === "Active" ? r.duration * 60 : undefined,
        }));
        // Sort ascending by MongoDB ObjectId (chronological order)
        formattedRounds.sort((a: Round, b: Round) => a.id.localeCompare(b.id));
        setRounds(formattedRounds);
      }
    } catch (error) {
      console.error("Failed to fetch rounds:", error);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRounds();
    setIsRefreshing(false);
  };
  
  const totalPages = Math.ceil(rounds.length / itemsPerPage);
  const currentRounds = rounds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const [formData, setFormData] = useState<{
    name: string;
    duration: number | string;
    status: Round["status"];
  }>({
    name: "",
    duration: 60,
    status: "Upcoming",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "duration") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/api/rounds/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            duration: Number(formData.duration),
            status: formData.status,
          }),
        });
        
        if (response.ok) {
          await fetchRounds();
          setEditingId(null);
          SwalToast.fire({ icon: 'success', title: 'Round updated' });
        }
      } else {
        const response = await fetch(`${API_URL}/api/rounds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            duration: Number(formData.duration),
            status: formData.status,
          }),
        });
        
        if (response.ok) {
          await fetchRounds();
          SwalToast.fire({ icon: 'success', title: 'Round created' });
        }
      }

      setFormData({
        name: "",
        duration: 60,
        status: "Upcoming",
      });
    } catch (error) {
      console.error("Error saving round:", error);
      SwalToast.fire({ icon: 'error', title: 'Failed to save round' });
    }
  };

  const handleEdit = (round: Round) => {
    setFormData({
      name: round.name,
      duration: round.duration,
      status: round.status,
    });
    setEditingId(round.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      duration: 60,
      status: "Upcoming",
    });
  };

  const toggleStatus = async (id: string, currentStatus: Round["status"]) => {
    if (currentStatus === "Completed") return;
    const newStatus = currentStatus === "Active" ? "Completed" : "Active";
    
    // Optimistic UI update to instantly show checkmark and start timer
    setRounds(rounds.map(r => r.id === id ? { 
      ...r, 
      status: newStatus,
      remainingSeconds: newStatus === "Active" ? r.duration * 60 : undefined 
    } : r));

    try {
      const response = await fetch(`${API_URL}/api/rounds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        await fetchRounds(); // Revert on failure
      } else {
        SwalToast.fire({ icon: 'success', title: `Round marked as ${newStatus}` });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteRound = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#18181b",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/api/rounds/${id}`, { method: 'DELETE' });
          if (response.ok) {
            await fetchRounds();
            if (editingId === id) cancelEdit();
            
            SwalToast.fire({ icon: 'success', title: 'Round deleted' });
          }
        } catch (error) {
          console.error("Error deleting round:", error);
        }
      }
    });
  };

  return (
    <>
      <PageMeta title="Rounds Management | Error404 Admin" description="Manage competition rounds" />

      <div className="flex flex-col gap-6 w-full">
        {/* Main Grid: 40% (Form) / 60% (Table) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full items-start">
          
          {/* Left Column (40%): Create Round Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm sticky top-24">
              <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {editingId ? "Edit Round" : "Create New Round"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {editingId ? "Update the details of the selected round." : "Configure timers and access for a new round."}
                  </p>
                </div>
                {editingId && (
                  <button onClick={cancelEdit} className="text-xs text-red-500 hover:text-red-600 font-medium">Cancel Edit</button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
                    Round Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-500"
                    placeholder="e.g. Finals"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
                      Duration (mins)
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-white/90">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      >
                        <option value="Upcoming" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Upcoming</option>
                        <option value="Active" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Active</option>
                        <option value="Completed" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Completed</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-blue-700 transition shadow-md"
                  >
                    {editingId ? "SAVE CHANGES" : "CREATE ROUND"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column (60%): Rounds Table */}
          <div className="lg:col-span-3 h-[calc(100vh-140px)]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm h-full flex flex-col">
              <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Existing Rounds
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage and monitor all competition rounds.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[140px]">
                    <Select 
                      options={[
                        { value: "5", label: "5 per page" },
                        { value: "10", label: "10 per page" },
                        { value: "20", label: "20 per page" }
                      ]}
                      defaultValue={itemsPerPage.toString()}
                      onChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}
                      className="!h-9 !py-1 !text-xs !bg-transparent dark:!bg-white/5 !border-gray-200 dark:!border-gray-800 !shadow-none"
                    />
                  </div>
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

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="pb-3 px-2 font-medium text-gray-500 dark:text-gray-400 text-sm">Round Name</th>
                      <th className="pb-3 px-2 font-medium text-gray-500 dark:text-gray-400 text-sm w-32">Duration</th>
                      <th className="pb-3 px-2 font-medium text-gray-500 dark:text-gray-400 text-sm w-32">Status</th>
                      <th className="pb-3 px-2 font-medium text-gray-500 dark:text-gray-400 text-sm text-right w-[140px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRounds.length > 0 ? (
                      currentRounds.map((round) => (
                        <tr key={round.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-2">
                            <div className="font-medium text-gray-800 dark:text-gray-200">{round.name}</div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {round.status === "Active" && round.remainingSeconds !== undefined ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest">
                                  {Math.floor(round.remainingSeconds / 60).toString().padStart(2, '0')}:{(round.remainingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                              ) : (
                                <span>{round.duration} mins</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                round.status === "Active"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                                  : round.status === "Completed"
                                  ? "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                              }`}
                            >
                              {round.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {/* Activate/Deactivate Toggle */}
                              {round.status !== "Completed" && (
                                <button
                                  onClick={() => toggleStatus(round.id, round.status)}
                                  className={`transition-colors ${
                                    round.status === "Active" 
                                      ? "text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300" 
                                      : "text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                  }`}
                                  title={round.status === "Active" ? "Complete Round" : "Activate Round"}
                                >
                                  {round.status === "Active" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                                  )}
                                </button>
                              )}
                              
                              {/* Edit Round */}
                              <button
                                onClick={() => handleEdit(round)}
                                className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                title="Edit Round"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              
                              {/* Delete Round */}
                              <button
                                onClick={() => deleteRound(round.id)}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Delete Round"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                          No rounds found. Create your first round to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="mt-4 flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
