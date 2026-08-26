import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import { ShieldCheck, AlertCircle, Search, ArrowLeft } from "lucide-react";

export default function CertificateVerify() {
  const { certificateCode } = useParams();
  const [code, setCode] = useState(certificateCode || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async (codeToVerify) => {
    const queryCode = (codeToVerify || code).trim();
    if (!queryCode) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await API.get("/certificates/verify/" + queryCode);
      if (res.data.success && res.data.valid) {
        setResult(res.data.certificate);
      } else {
        setError(res.data.message || "Invalid certificate code.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.message || "Certificate not found or verification code is invalid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateCode) {
      handleVerify(certificateCode);
    }
  }, [certificateCode]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo-icon.png" alt="CampusConnect Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition" />
          <span className="font-extrabold text-slate-900 text-lg">Campus<span className="text-blue-600">Connect</span></span>
        </Link>
        <Link
          to="/login"
          className="text-xs font-semibold text-gray-600 hover:text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </nav>

      <main className="p-6 md:p-12 flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Certificate Verification Portal
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Verify the authenticity of CampusConnect certificates issued for college events.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="mt-6 flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CC-2026-TF-A1B2C3"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-md"
              >
                {loading ? "Verifying..." : "Verify Now"}
              </button>
            </form>
          </div>

          {result && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-500">
              <div className="flex items-center gap-3 text-green-600 mb-6 bg-green-50 p-4 rounded-2xl border border-green-100">
                <ShieldCheck size={28} className="shrink-0" />
                <div>
                  <h3 className="font-bold text-base text-green-900">Certificate Verified & Authenticated</h3>
                  <p className="text-xs text-green-700">
                    This credential was officially issued by {result.collegeName}.
                  </p>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-gray-100 text-sm">
                <div className="pt-2 flex justify-between">
                  <span className="text-gray-500">Certificate ID:</span>
                  <span className="font-mono font-bold text-gray-900">{result.certificateCode}</span>
                </div>
                <div className="pt-3 flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-bold text-gray-900">{result.studentName}</span>
                </div>
                <div className="pt-3 flex justify-between">
                  <span className="text-gray-500">Department / Year:</span>
                  <span className="text-gray-800">
                    {(result.studentDepartment || "General") + (result.studentYear ? " • Year " + result.studentYear : "")}
                  </span>
                </div>
                <div className="pt-3 flex justify-between">
                  <span className="text-gray-500">Event Name:</span>
                  <span className="font-bold text-blue-700">{result.eventTitle}</span>
                </div>
                <div className="pt-3 flex justify-between">
                  <span className="text-gray-500">Event Venue:</span>
                  <span className="text-gray-800">{result.eventVenue}</span>
                </div>
                <div className="pt-3 flex justify-between">
                  <span className="text-gray-500">Event Date:</span>
                  <span className="text-gray-800">
                    {new Date(result.eventDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="pt-3 flex justify-between">
                  <span className="text-gray-500">Issue Date:</span>
                  <span className="text-gray-800">
                    {new Date(result.issueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-300 p-6 rounded-3xl text-center text-red-700">
              <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
              <h3 className="font-bold text-base">Invalid or Unverified Certificate</h3>
              <p className="text-xs mt-1 text-red-600">{error}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        CampusConnect Authenticated Credential Verification System
      </footer>
    </div>
  );
}