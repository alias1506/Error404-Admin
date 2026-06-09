import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";

interface OnboardingProps {
  onComplete?: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleNext = () => {
    if (localStorage.getItem("isAuthenticated") === "true") {
      localStorage.setItem("hasSeenOnboarding", "true");
    } else {
      sessionStorage.setItem("hasSeenOnboarding", "true");
    }
    if (onComplete) {
      onComplete();
    } else {
      navigate("/");
    }
  };

  const rules = [
    {
      title: "Data Privacy & Security",
      description: "Always handle user data with the utmost confidentiality. Do not share credentials or access with unauthorized personnel.",
    },
    {
      title: "System Integrity",
      description: "Any modifications to the core event configurations must be logged and reviewed by a senior administrator.",
    },
    {
      title: "Community Guidelines",
      description: "Maintain a respectful environment when interacting with attendees and staff members through the portal.",
    },
    {
      title: "Compliance",
      description: "Ensure all event actions comply with the Error404 code of conduct and institutional policies.",
    }
  ];

  return (
    <>
      <PageMeta
        title="Admin Onboarding | Error404"
        description="Please review the rules and regulations before proceeding."
      />
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Content Card */}
        <div className="relative z-10 w-full max-w-4xl p-8 sm:p-12 mx-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col gap-8">
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4 tracking-tight">
              Welcome to the Admin Portal
            </h1>
            <p className="text-gray-400 text-lg">
              Please review our core principles and guidelines before proceeding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {rules.map((rule, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/50 hover:bg-white/10 transition-all duration-300 flex gap-4"
              >
                <div className="flex-shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                  <span className="font-semibold text-lg">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{rule.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="accept" 
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500 cursor-pointer transition-colors"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <label htmlFor="accept" className="text-gray-300 text-sm sm:text-base cursor-pointer select-none">
                I have read and agree to follow these guidelines.
              </label>
            </div>
            
            <button
              onClick={handleNext}
              disabled={!accepted}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                accepted 
                  ? "bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_20px_rgba(var(--color-brand-500),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-brand-500),0.5)] transform hover:-translate-y-0.5" 
                  : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
            >
              Continue to Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
