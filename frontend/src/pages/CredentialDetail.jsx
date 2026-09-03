import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import Footer from "../components/Footer";
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Building2,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Share2,
} from "lucide-react";

export default function CredentialDetail() {
  const { credentialId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCredential();
  }, [credentialId]);

  const fetchCredential = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/credentials/verify/${credentialId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Credential not found in registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="CampusConnect" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-white text-base tracking-tight">Campus<span className="text-blue-500">Connect</span></span>
          </Link>
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft size={13} /> Back to Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Verifying cryptographic hash in registry...</p>
          </div>
        ) : error || !data || data.status === "NOT_FOUND" ? (
          <div className="bg-slate-900 rounded-3xl p-8 border border-red-500/30 text-center shadow-2xl">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid Credential</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">{error || "This credential ID does not exist."}</p>
            <Link to="/" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition">
              Return Home
            </Link>
          </div>
        ) : data.status === "REVOKED" ? (
          <div className="bg-slate-900 rounded-3xl p-8 border border-amber-500/40 text-center shadow-2xl space-y-4">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
            <span className="bg-amber-500/20 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-amber-500/40 inline-block">
              REVOKED CREDENTIAL
            </span>
            <h2 className="text-2xl font-bold text-white">{data.credential.title}</h2>
            <p className="text-slate-400 text-xs">Recipient: {data.credential.recipientName}</p>
            <p className="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-xl border border-amber-900/50 max-w-md mx-auto">
              Revocation Reason: {data.revocationReason}
            </p>
          </div>
        ) : (
          /* VALID VERIFIABLE CREDENTIAL */
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Cryptographically Certified
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">ID: {data.credential.credentialId}</span>
            </div>

            {/* Credential Main Info */}
            <div className="space-y-2 text-center py-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Verifiable Academic Credential</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{data.credential.title}</h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">{data.credential.description}</p>
            </div>

            {/* Details Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <User size={13} className="text-blue-400" /> Awarded To
                </span>
                <p className="font-bold text-white text-sm">{data.credential.recipientName}</p>
                <p className="text-slate-400 text-[11px]">{data.credential.recipientDepartment}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Building2 size={13} className="text-indigo-400" /> Issuing Authority
                </span>
                <p className="font-bold text-white text-sm">{data.credential.issuerName}</p>
                <p className="text-slate-400 text-[11px]">{data.credential.college?.name}</p>
              </div>

              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-400" /> Issue Timestamp
                </span>
                <p className="font-medium text-slate-300">{new Date(data.credential.issueDate).toUTCString()}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-slate-500 font-semibold font-mono">SHA-256 Proof Hash:</span>
                <p className="font-mono text-[11px] text-slate-400 break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  {data.credential.cryptoHash}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              {data.credential.linkedInShareUrl && (
                <a
                  href={data.credential.linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20"
                >
                  <Share2 size={16} /> Add to LinkedIn Profile
                </a>
              )}

              <button
                onClick={handleCopy}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                {copied ? "Link Copied!" : "Copy Verification URL"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}