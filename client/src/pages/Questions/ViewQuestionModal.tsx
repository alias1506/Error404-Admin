import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Modal } from "../../components/ui/modal";

const API_URL = import.meta.env.VITE_API_URL || "";

interface ViewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string | null;
}

export default function ViewQuestionModal({ isOpen, onClose, questionId }: ViewQuestionModalProps) {
  const [question, setQuestion] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && questionId) {
      const fetchQuestion = async () => {
        try {
          const response = await fetch(`${API_URL}/api/questions/${questionId}`);
          if (response.ok) {
            const data = await response.json();
            const formattedQuestion = {
              ...data,
              xp: data.xpReward,
              round: data.roundId?.name || "Unknown Round",
              languages: data.codes.map((c: any) => c.language)
            };
            setQuestion(formattedQuestion);
            if (formattedQuestion.languages.length > 0) {
              setActiveTab(formattedQuestion.languages[0]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch question:", error);
        }
      };
      fetchQuestion();
    } else {
      setQuestion(null);
    }
  }, [isOpen, questionId]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-6 !rounded-[24px]">
      {!question ? (
        <div className="flex items-center justify-center h-[500px] w-full">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="flex flex-col h-[70vh] min-h-[500px]">
          <div className="mb-6 border-b border-gray-200 pb-5 dark:border-gray-800 pr-12 relative">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {question.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold border ${
                question.difficulty === "Easy" ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-500 dark:border-green-500/20" :
                question.difficulty === "Medium" ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500/20" :
                "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20"
              }`}>
                {question.difficulty}
              </span>
              <span className="inline-flex items-center py-1 px-3 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:border-blue-500/20">
                {question.xp} XP
              </span>
              <span className="inline-flex items-center py-1 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-gray-700">
                {question.round}
              </span>
            </div>
          </div>

          {question.expectedOutput && (
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-800 w-full">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Expected Output</h4>
              <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {question.expectedOutput}
              </pre>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 w-full flex flex-col flex-1 min-h-0 bg-white dark:bg-transparent">
            {question.languages.length > 0 ? (
              <div className="flex flex-col h-full rounded-xl overflow-hidden">
                <div className="flex flex-wrap bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
                  {question.languages.map((lang: string) => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-r border-gray-200 dark:border-gray-800 ${
                        activeTab === lang
                          ? "bg-white dark:bg-[#1a1a1a] border-b-2 border-b-blue-500 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-[#181818]"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {activeTab && (
                  <div className="grid grid-cols-2 gap-0 divide-x divide-gray-200 dark:divide-gray-800 flex-1 min-h-0">
                    <div className="flex flex-col bg-[#1e1e1e] flex-1 min-h-0">
                      <div className="px-4 py-2 bg-black/40 border-b border-gray-800 flex justify-between items-center shrink-0">
                        <span className="text-xs font-mono text-green-400">Correct Solution</span>
                      </div>
                      <div className="flex-1 min-h-0 relative">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={activeTab === 'c' || activeTab === 'cpp' ? 'cpp' : activeTab}
                          value={question.codes?.find((c: any) => c.language === activeTab)?.correctSolution || "// No code available"}
                          options={{
                            readOnly: true,
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
                          value={question.codes?.find((c: any) => c.language === activeTab)?.buggyCode || "// No code available"}
                          options={{
                            readOnly: true,
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
              <div className="flex-1 min-h-0 flex items-center justify-center p-8">
                <p className="text-gray-500 dark:text-gray-400">No language implementations found for this challenge.</p>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
