import { useState, useEffect } from "react";
import { SwalToast } from "../../components/ui/toast/toast";
import Editor from "@monaco-editor/react";
import { Modal } from "../../components/ui/modal";

const ALL_LANGUAGES = [
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
  { id: "python", name: "Python" },
];

const API_URL = import.meta.env.VITE_API_URL || "";

type Round = {
  id: string;
  name: string;
};

type LanguageCode = {
  language: string;
  buggyCode: string;
  correctSolution: string;
};

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string | null;
  onSuccess?: () => void;
}

export default function EditQuestionModal({ isOpen, onClose, questionId, onSuccess }: EditQuestionModalProps) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    xpReward: "10",
    roundId: "",
    expectedOutput: "",
  });

  const [languageCodes, setLanguageCodes] = useState<LanguageCode[]>([]);
  const [selectedLanguageToAdd, setSelectedLanguageToAdd] = useState(ALL_LANGUAGES[0].id);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchRounds = async () => {
        try {
          const response = await fetch(`${API_URL}/api/rounds`);
          if (response.ok) {
            const data = await response.json();
            setRounds(data.map((r: any) => ({ id: r._id, name: r.name })));
          }
        } catch (error) {
          console.error("Failed to fetch rounds:", error);
        }
      };
      fetchRounds();

      if (questionId) {
        const fetchQuestion = async () => {
          try {
            const response = await fetch(`${API_URL}/api/questions/${questionId}`);
            if (response.ok) {
              const data = await response.json();
              setFormData({
                title: data.title,
                difficulty: data.difficulty,
                xpReward: data.xpReward.toString(),
                roundId: data.roundId?._id || "",
                expectedOutput: data.expectedOutput || ""
              });
              
              setLanguageCodes(data.codes);
              if (data.codes.length > 0) setActiveTab(data.codes[0].language);
            }
          } catch (error) {
            console.error("Failed to fetch question for edit:", error);
          }
        };
        fetchQuestion();
      }
    }
  }, [isOpen, questionId]);

  useEffect(() => {
    const available = ALL_LANGUAGES.find(
      (lang) => !languageCodes.some((lc) => lc.language === lang.id)
    );
    if (available) {
      setSelectedLanguageToAdd(available.id);
    }
  }, [languageCodes]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData({
        ...formData,
        title: value,
      });
    } else if (name === "xpReward") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "") });
    } else if (name === "difficulty") {
      let defaultXp = formData.xpReward;
      if (value === "Easy") defaultXp = "10";
      else if (value === "Medium") defaultXp = "20";
      else if (value === "Hard") defaultXp = "30";
      
      setFormData({ ...formData, difficulty: value, xpReward: defaultXp });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addLanguage = () => {
    if (selectedLanguageToAdd && !languageCodes.some((lc) => lc.language === selectedLanguageToAdd)) {
      setLanguageCodes([
        ...languageCodes,
        { language: selectedLanguageToAdd, buggyCode: "", correctSolution: "" },
      ]);
      setActiveTab(selectedLanguageToAdd);
    }
  };

  const removeLanguage = (langId: string) => {
    const newLangCodes = languageCodes.filter((lc) => lc.language !== langId);
    setLanguageCodes(newLangCodes);
    if (activeTab === langId) {
      setActiveTab(newLangCodes.length > 0 ? newLangCodes[0].language : null);
    }
  };

  const updateLanguageCode = (
    langId: string,
    field: "buggyCode" | "correctSolution",
    value: string | undefined
  ) => {
    setLanguageCodes(
      languageCodes.map((lc) =>
        lc.language === langId ? { ...lc, [field]: value || "" } : lc
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (languageCodes.length === 0) {
      SwalToast.fire({
        icon: "error",
        title: "Please add at least one language with code."
      });
      return;
    }
    
    const payload = {
      ...formData,
      codes: languageCodes
    };
    
    try {
      const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        SwalToast.fire({
          icon: "success",
          title: "Question updated successfully"
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update question");
      }
    } catch (error: any) {
      SwalToast.fire({
        icon: "error",
        title: error.message || "Something went wrong"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-6 !rounded-[24px]">
      <div className="flex flex-col h-[85vh] min-h-[600px]">
        <div className="mb-4 border-b border-gray-200 pb-3 dark:border-gray-800 flex justify-between items-center pr-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Challenge
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update the problem description, test cases, and code implementations.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full border border-gray-200 p-3 rounded-xl dark:border-gray-800 shrink-0">
            <div className="md:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-white/90">
                Question Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-500"
                placeholder="e.g. Reverse a String"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-white/90">
                Expected Output
              </label>
              <textarea
                name="expectedOutput"
                value={formData.expectedOutput}
                onChange={handleChange}
                required
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-500 font-mono"
                placeholder="e.g. Hello World"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-white/90">
                Difficulty
              </label>
              <div className="relative">
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="h-10 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2 pr-11 text-sm shadow-theme-xs focus:border-blue-500 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-white/90">
                XP Reward
              </label>
              <input
                type="text"
                name="xpReward"
                value={formData.xpReward}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-white/90">
                Round
              </label>
              <div className="relative">
                <select
                  name="roundId"
                  value={formData.roundId}
                  onChange={handleChange}
                  className="h-10 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2 pr-11 text-sm shadow-theme-xs focus:border-blue-500 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {rounds.length === 0 ? (
                    <option value="" disabled className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">No rounds available</option>
                  ) : (
                    rounds.map((round) => (
                      <option key={round.id} value={round.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                        {round.name}
                      </option>
                    ))
                  )}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 w-full flex flex-col gap-3 flex-1 min-h-[400px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800 gap-2 shrink-0">
              <div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Language Implementations
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Edit code implementations for each supported language.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <select
                    value={selectedLanguageToAdd}
                    onChange={(e) => setSelectedLanguageToAdd(e.target.value)}
                    className="h-9 appearance-none rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 pr-8 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 min-w-[130px]"
                  >
                    {ALL_LANGUAGES.map((lang) => {
                      const isAdded = languageCodes.some((lc) => lc.language === lang.id);
                      return (
                        <option key={lang.id} value={lang.id} disabled={isAdded} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                          {lang.name} {isAdded ? "(Added)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addLanguage}
                  disabled={languageCodes.length === ALL_LANGUAGES.length}
                  className="h-9 flex items-center justify-center rounded-lg bg-gray-800 px-4 text-sm font-medium text-white hover:bg-gray-700 transition dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50"
                >
                  Add Language
                </button>
              </div>
            </div>

            {languageCodes.length > 0 ? (
              <div className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1 min-h-0">
                <div className="flex flex-wrap bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-700 shrink-0">
                  {languageCodes.map((lc) => {
                    const langName = ALL_LANGUAGES.find((l) => l.id === lc.language)?.name;
                    const isDirty = Boolean(lc.buggyCode?.trim() || lc.correctSolution?.trim());
                    return (
                      <div
                        key={lc.language}
                        className={`group flex items-center gap-2 px-4 py-3 cursor-pointer border-r border-gray-200 dark:border-gray-700 transition-colors ${
                          activeTab === lc.language
                            ? "bg-white dark:bg-[#1a1a1a] border-b-2 border-b-blue-500 text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#181818]"
                        }`}
                        onClick={() => setActiveTab(lc.language)}
                      >
                        <span className={`text-sm font-medium pr-1 transition-colors ${isDirty ? 'text-amber-500 dark:text-amber-400' : ''}`}>
                          {langName}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLanguage(lc.language);
                          }}
                          className="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-red-500 transition rounded-md"
                          title="Close tab"
                        >
                          <span className="block text-lg leading-none mb-0.5">×</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {activeTab && (
                  <div className="grid grid-cols-2 gap-0 divide-x divide-gray-200 dark:divide-gray-700 flex-1 min-h-0">
                    <div className="flex flex-col bg-[#1e1e1e] flex-1 min-h-0">
                      <div className="px-4 py-2 bg-black/40 border-b border-gray-800 flex justify-between items-center shrink-0">
                        <span className="text-xs font-mono text-green-400">Correct Solution</span>
                      </div>
                      <div className="flex-1 min-h-0 relative">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={activeTab === 'c' || activeTab === 'cpp' ? 'cpp' : activeTab}
                          value={languageCodes.find((lc) => lc.language === activeTab)?.correctSolution}
                          onChange={(val) => updateLanguageCode(activeTab, "correctSolution", val)}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 16, bottom: 16 },
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col bg-[#1e1e1e] flex-1 min-h-0">
                      <div className="px-4 py-2 bg-black/40 border-b border-gray-800 flex justify-between items-center shrink-0">
                        <span className="text-xs font-mono text-red-400">Buggy Code (Starter)</span>
                      </div>
                      <div className="flex-1 min-h-0 relative">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={activeTab === 'c' || activeTab === 'cpp' ? 'cpp' : activeTab}
                          value={languageCodes.find((lc) => lc.language === activeTab)?.buggyCode}
                          onChange={(val) => updateLanguageCode(activeTab, "buggyCode", val)}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 16, bottom: 16 },
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                  No languages added yet. Select a language above and click "Add Language".
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-0 pb-1 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-lg transition-colors mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-10 py-2.5 text-sm font-bold tracking-wide text-white hover:bg-blue-700 transition shadow-md"
            >
              UPDATE CHALLENGE
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
