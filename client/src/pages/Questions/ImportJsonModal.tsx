import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { Modal } from "../../components/ui/modal";
import Select from "../../components/form/Select";
import { useDropzone } from "react-dropzone";

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

import { SwalToast } from "../../components/ui/toast/toast";

const SAMPLE_JSON = [
  {
    "title": "Your Question Title Here",
    "difficulty": "Easy",
    "xpReward": 10,
    "expectedOutput": "Hello World",
    "codes": [
      {
        "language": "c",
        "buggyCode": "// Buggy C code\n#include <stdio.h>\nint main() { return 0; }",
        "correctSolution": "// Correct C solution\n#include <stdio.h>\nint main() { return 0; }"
      },
      {
        "language": "cpp",
        "buggyCode": "// Buggy C++ code\n#include <iostream>\nusing namespace std;\nint main() { return 0; }",
        "correctSolution": "// Correct C++ solution\n#include <iostream>\nusing namespace std;\nint main() { return 0; }"
      },
      {
        "language": "java",
        "buggyCode": "// Buggy Java code\nclass Solution {\n  public static void main(String[] args) {}\n}",
        "correctSolution": "// Correct Java solution\nclass Solution {\n  public static void main(String[] args) {}\n}"
      },
      {
        "language": "python",
        "buggyCode": "# Buggy Python code\ndef solution():\n    pass",
        "correctSolution": "# Correct Python solution\ndef solution():\n    pass"
      }
    ]
  }
];

export default function ImportJsonModal({ isOpen, onClose, onSuccess }: ImportJsonModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rounds, setRounds] = useState<{ value: string; label: string }[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>("");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
    multiple: false,
    disabled: isUploading
  });

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/api/rounds`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.map((r: any) => ({ value: r._id, label: r.name }));
          setRounds(formatted);
          if (formatted.length > 0) setSelectedRound(formatted[0].value);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleDownloadSample = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SAMPLE_JSON, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "Questions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async () => {
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select a JSON file to import.",
        background: "#18181b",
        color: "#fff",
      });
      return;
    }

    if (!selectedRound) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select a round before importing.",
        background: "#18181b",
        color: "#fff",
      });
      return;
    }

    let progressInterval: any;
    setIsUploading(true);
    setUploadProgress(0);

    progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 150);

    try {
      const fileText = await file.text();
      let jsonData;
      try {
        jsonData = JSON.parse(fileText);
        // Inject roundId dynamically
        if (Array.isArray(jsonData)) {
          jsonData = jsonData.map((q: any) => ({ ...q, roundId: selectedRound }));
        } else {
          jsonData.roundId = selectedRound;
          jsonData = [jsonData]; // Ensure it's an array
        }
      } catch (err) {
        clearInterval(progressInterval);
        SwalToast.fire({ icon: "error", title: "Invalid JSON", text: "The selected file is not valid JSON." });
        setIsUploading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/questions/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to import questions");
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        SwalToast.fire({
          icon: "success",
          title: "Questions imported successfully"
        });
        
        onSuccess();
        onClose();
        setIsUploading(false);
      }, 500);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error("Import error:", error);
      SwalToast.fire({
        icon: "error",
        title: "Import Failed",
        text: error.message || "An error occurred while importing."
      });
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 !rounded-[24px]">
      <div className="flex flex-col">
        <div className="mb-6 border-b border-gray-200 pb-3 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Import Questions JSON
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload a JSON file containing an array of questions.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div 
            {...getRootProps()}
            className={`relative flex items-center justify-center min-h-[220px] border-2 border-dashed rounded-xl p-8 bg-transparent transition cursor-pointer ${
              isDragActive 
                ? "border-brand-500 bg-brand-500/10 scale-[1.02]" 
                : "border-gray-600 dark:border-gray-700 hover:bg-white/5"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            
            <div className="text-center w-full">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-16 h-16">
                    <svg className="animate-spin w-full h-full text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {uploadProgress}%
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-brand-500 mt-4">
                    Importing Questions...
                  </p>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {file ? (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <p className="text-sm font-semibold text-brand-500">{file.name}</p>
                      {!isUploading && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-red-500/10 transition"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-white dark:text-gray-200 mt-2">
                        Drag & drop a JSON file here, or click to select
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Only .json files are supported
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Round to import into
            </label>
            {rounds.length > 0 ? (
              <Select 
                options={rounds} 
                defaultValue={selectedRound} 
                onChange={(val) => setSelectedRound(val)} 
              />
            ) : (
              <div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 flex items-center text-sm text-gray-500">
                Loading rounds...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={handleDownloadSample}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              DOWNLOAD JSON FILE
            </button>

            <button
              onClick={handleImport}
              disabled={isUploading || !file}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold tracking-wide text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "IMPORTING..." : "IMPORT QUESTIONS"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
