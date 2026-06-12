import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CustomSwal as Swal } from "../../components/ui/swal/swal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Select from "../../components/form/Select";
import Pagination from "../../components/common/Pagination";
import ViewQuestionModal from "./ViewQuestionModal";
import EditQuestionModal from "./EditQuestionModal";
import ImportJsonModal from "./ImportJsonModal";
import Checkbox from "../../components/form/input/Checkbox";
import Loader from "../../components/common/Loader";

interface Question {
  _id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  round: string;
  languages: string[];
}

const API_URL = import.meta.env.VITE_API_URL || "";

import { SwalToast } from "../../components/ui/toast/toast";

export default function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRound, setSelectedRound] = useState<string>("All Rounds");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [availableRounds, setAvailableRounds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRounds = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rounds`);
      if (response.ok) {
        const data = await response.json();
        const roundNames = data.map((r: any) => r.name);
        setAvailableRounds(roundNames);
      }
    } catch (error) {
      console.error("Failed to fetch rounds:", error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questions`);
      if (response.ok) {
        const data = await response.json();
        const formattedQuestions = data.map((q: any) => ({
          _id: q._id,
          title: q.title,
          difficulty: q.difficulty,
          xp: q.xpReward,
          round: q.roundId?.name || "Unknown Round",
          languages: q.codes.map((c: any) => c.language)
        }));
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
    loadRounds();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesRound = selectedRound === "All Rounds" || q.round === selectedRound;
    return matchesSearch && matchesRound;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentQuestions.map(q => q._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async (q: Question) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete ${q.title}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/questions/${q._id}`, { method: 'DELETE' });
        if (response.ok) {
          setQuestions((prev) => prev.filter(item => item._id !== q._id));
          setTimeout(() => SwalToast.fire({ icon: 'success', title: 'Question deleted successfully' }), 300);
        } else {
          SwalToast.fire({ icon: 'error', title: 'Failed to delete question' });
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        SwalToast.fire({ icon: 'error', title: 'Error deleting question' });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete ${selectedIds.length} questions? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/questions/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (response.ok) {
          setQuestions((prev) => prev.filter(q => !selectedIds.includes(q._id)));
          setSelectedIds([]);
          setTimeout(() => SwalToast.fire({ icon: 'success', title: 'Questions deleted successfully' }), 300);
        } else {
          SwalToast.fire({ icon: 'error', title: 'Failed to delete questions' });
        }
      } catch (error) {
        SwalToast.fire({ icon: 'error', title: 'Server error' });
      }
    }
  };

  return (
    <>
      <PageMeta
        title="All Questions | Error404 Admin"
        description="View and manage all coding challenges."
      />
      <PageBreadcrumb pageTitle="All Questions" />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-1/2 md:w-1/3">
          <input 
            type="text" 
            placeholder="Search questions by title..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-white/5 dark:text-white/90 dark:focus:border-brand-500 transition-colors"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-[180px]">
            <Select 
              options={[
                { value: "All Rounds", label: "All Rounds" },
                ...availableRounds.map(r => ({ value: r, label: r }))
              ]}
              defaultValue={selectedRound}
              onChange={(value) => { setSelectedRound(value); setCurrentPage(1); }}
              className="!h-10 !py-1.5 !bg-transparent dark:!bg-white/5 !border-gray-200 dark:!border-gray-800 !shadow-none"
            />
          </div>

          <div className="w-[140px]">
            <Select 
              options={[
                { value: "5", label: "5 per page" },
                { value: "10", label: "10 per page" },
                { value: "20", label: "20 per page" }
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
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import JSON
          </button>
          <Link
            to="/questions/create"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Question
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-gray-900/60 rounded-xl">
            <Loader text="Loading questions..." />
          </div>
        )}
        <div className={`max-w-full overflow-x-auto ${loading ? 'opacity-40 pointer-events-none' : ''}`}>
          <Table className="table-fixed">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={currentQuestions.length > 0 && selectedIds.length === currentQuestions.length}
                      onChange={handleSelectAll}
                    />
                    <span>#</span>
                  </div>
                </TableCell>
                <TableCell isHeader className="w-[35%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title</TableCell>
                <TableCell isHeader className="w-[15%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Difficulty</TableCell>
                <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">XP</TableCell>
                <TableCell isHeader className="w-[20%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Round</TableCell>
                <TableCell isHeader className="w-[15%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Languages</TableCell>
                <TableCell isHeader className="w-[15%] px-5 py-4 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {!loading && filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 text-center text-gray-500 dark:text-gray-400 h-[350px]" colSpan={7}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No questions found</p>
                      <p className="text-sm">Try adjusting your search or add a new question.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentQuestions.map((q, index) => (
                  <TableRow key={q._id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <Checkbox 
                        checked={selectedIds.includes(q._id)}
                        onChange={() => handleSelectOne(q._id)}
                      />
                      <span>{(currentPage - 1) * itemsPerPage + index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{q.title}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium border ${
                      q.difficulty === "Easy" ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-500 dark:border-green-500/20" :
                      q.difficulty === "Medium" ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500/20" :
                      "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20"
                    }`}>
                      {q.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                    {q.xp} XP
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                    {q.round}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex flex-wrap gap-1.5">
                      {q.languages.map(lang => (
                        <span key={lang} className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-100 rounded-md dark:text-gray-400 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-end">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setSelectedQuestionId(q._id); setIsViewModalOpen(true); }} className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors" title="View Question">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button onClick={() => { setSelectedQuestionId(q._id); setIsEditModalOpen(true); }} className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors" title="Edit Question">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(q)} className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400 transition-colors" title="Delete Question">
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

      <div className="mt-4 flex justify-end">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ViewQuestionModal 
        isOpen={isViewModalOpen} 
        onClose={() => { setIsViewModalOpen(false); setSelectedQuestionId(null); }} 
        questionId={selectedQuestionId} 
      />
      
      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQuestionId(null);
        }}
        questionId={selectedQuestionId}
        onSuccess={loadQuestions}
      />

      <ImportJsonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadQuestions}
      />
    </>
  );
}
