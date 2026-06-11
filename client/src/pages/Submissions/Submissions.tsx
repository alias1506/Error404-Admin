import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/form/Select";
import { SwalToast } from "../../components/ui/toast/toast";
import { CustomSwal as Swal } from "../../components/ui/swal/swal";
import { Modal } from "../../components/ui/modal";
import Editor from "@monaco-editor/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Submission {
  _id: string;
  user: { _id: string; username: string; email: string };
  question: { _id: string; title: string };
  language: string;
  verdict: string;
  type?: 'Save' | 'Submit';
  executionTime: number;
  codeSubmitted: string;
  createdAt: string;
  totalSaves?: number;
  totalSubmits?: number;
}

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserObj, setSelectedUserObj] = useState<any>(null);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter((sub) => 
    sub.user?.username?.toLowerCase().includes(search.toLowerCase()) || 
    sub.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    sub.question?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentSubmissions = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Submission?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_URL}/api/submissions/${id}`, { method: 'DELETE' });
          if (res.ok) {
            SwalToast.fire({ icon: 'success', title: 'Submission deleted' });
            setSubmissions(prev => prev.filter(s => s._id !== id));
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const handleViewUserSubmissions = async (user: any) => {
    setSelectedUserObj(user);
    try {
      const res = await fetch(`${API_URL}/api/submissions/user/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setUserSubmissions(data.data);
        setIsUserModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch user submissions", error);
    }
  };

  const renderVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">Accepted</span>;
      case 'Pending':
      case 'Saved':
        return <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">{verdict}</span>;
      default:
        return <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-500/20 dark:text-red-400">{verdict}</span>;
    }
  };

  return (
    <>
      <PageMeta title="Submissions | Error404 Admin" description="View all user submissions" />
      <PageBreadcrumb pageTitle="Submissions" />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-1/2 md:w-1/3">
          <input 
            type="text" 
            placeholder="Search submissions by user or question..." 
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

          <button 
            onClick={() => fetchSubmissions()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors w-full sm:w-auto justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refresh Data
          </button>
        </div>
      </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table className="table-fixed">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-[20%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                    <TableCell isHeader className="w-[25%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Question</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Lang</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Saves</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Submits</TableCell>
                    <TableCell isHeader className="w-[15%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading submissions...</TableCell>
                    </TableRow>
                  ) : filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={7}>
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No submissions found</p>
                          <p className="text-sm">Try adjusting your search or refresh the data.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSubmissions.map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-semibold text-lg">
                              {sub.user?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {sub.user?.username || 'Unknown'}
                              </span>
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400 mt-0.5">
                                {sub.user?.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-800 dark:text-gray-300">{sub.question?.title || 'Deleted Question'}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300 uppercase tracking-wider">
                            {sub.language}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">
                            {sub.totalSaves || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                            {sub.totalSubmits || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(sub.createdAt).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-end">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleViewUserSubmissions(sub.user)}
                              className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                              title="View All User Submissions"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(sub._id)}
                              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
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

          <div className="mt-4 flex justify-end">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>

      {/* View Code Modal */}
      {selectedSubmission !== null && (
        <div style={{ zIndex: 999999 }} className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                Submitted Code
              </h3>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-0 flex-1 min-h-[60vh] bg-[#1e1e1e] overflow-hidden">
              <Editor
                height="60vh"
                language={selectedSubmission.language === "c++" ? "cpp" : selectedSubmission.language || "javascript"}
                theme="vs-dark"
                value={selectedSubmission.codeSubmitted}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  padding: { top: 16 }
                }}
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-900/50">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Submissions Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} className="max-w-4xl p-8 !rounded-[36px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold text-2xl">
              {selectedUserObj?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedUserObj?.username}'s Submissions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedUserObj?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {userSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No submissions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userSubmissions.map((s) => (
                <div key={s._id} className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:border-brand-500/30">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white text-lg">{s.question?.title || 'Unknown Question'}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(s.createdAt).toLocaleString()}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
                        {s.language}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${s.type === 'Save' ? 'text-amber-500' : 'text-brand-500'}`}>
                        {s.type === 'Save' ? 'SAVE' : 'SUBMIT'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    {renderVerdictBadge(s.verdict)}
                    <button
                      onClick={() => setSelectedSubmission(s)}
                      className="text-brand-500 hover:text-white bg-brand-50 hover:bg-brand-500 dark:bg-brand-500/10 dark:hover:bg-brand-500 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
