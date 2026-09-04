import { useState } from "react";
import api from "../api/api";
import { Sparkles, ArrowRight, Check, X, Compass, Award, Rocket } from "lucide-react";

export default function OnboardingModal({ isOpen, onComplete }) {
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState("Computer Science");
  const [year, setYear] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState(["Artificial Intelligence", "Web Development"]);
  const [selectedGoals, setSelectedGoals] = useState(["Internship Ready", "Hackathon Winner"]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const interestsList = [
    "Artificial Intelligence",
    "Machine Learning",
    "Web Development",
    "Cloud Computing",
    "Cybersecurity",
    "DevOps",
    "UI/UX Design",
    "Leadership & Management",
    "Competitive Coding",
  ];

  const goalsList = [
    "Internship Ready",
    "Hackathon Winner",
    "Open Source Contributor",
    "Club Leadership",
    "Academic Research",
    "Verifiable Credentials",
  ];

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleGoal = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleFinish = async () => {
    try {
      setSaving(true);
      await api.post("/passport/onboarding", {
        department,
        year,
        interests: selectedInterests,
        careerGoals: selectedGoals,
      });
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Onboarding error:", err);
      if (onComplete) onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Personalize Your Campus Experience</h3>
              <p className="text-[11px] text-slate-400">Step {step} of 3 • AI Customization</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {Math.round((step / 3) * 100)}%
          </span>
        </div>

        {/* STEP 1: Academic Discipline */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-900">What is your academic department & year?</h4>
            <p className="text-xs text-slate-500">This tunes event recommendations and skill tracks.</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Telecom">Electronics & Telecommunication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Management Studies">Management Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Academic Year</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`py-2 rounded-xl text-xs font-bold transition border ${
                        year === y
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Year {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Interests & Technologies */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-900">Select topics you are passionate about</h4>
            <p className="text-xs text-slate-500">Pick at least 2 categories for your Skill Graph.</p>

            <div className="flex flex-wrap gap-2 pt-2 max-h-56 overflow-y-auto">
              {interestsList.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                      active
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {active && <Check size={12} />} {interest}
                  </button>
                );
              })}
            </div>

            <div className="pt-6 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Career Goals */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-900">What are your primary campus goals?</h4>
            <p className="text-xs text-slate-500">The AI Copilot will tailor your Internship Readiness score accordingly.</p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {goalsList.map((goal) => {
                const active = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Rocket size={14} />
                      {active && <Check size={12} />}
                    </div>
                    {goal}
                  </button>
                );
              })}
            </div>

            <div className="pt-6 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {saving ? "Building Passport..." : "Build My Campus Passport"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}