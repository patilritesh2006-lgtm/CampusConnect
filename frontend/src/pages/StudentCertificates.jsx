import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Award, CheckCircle2, ShieldCheck, Printer, X, ExternalLink } from "lucide-react";

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const navigate = useNavigate();

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await API.get("/certificates/my");
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      console.error("Fetch certs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="STUDENT" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-1">
                <Award size={18} />
                Verified Credentials
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-gray-600 text-sm mt-1">
                Official certificates of participation and achievement issued for completed campus events.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/verify-certificate"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <ShieldCheck size={16} />
                Verify Certificate
              </Link>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Loading your certificates...</p>
            </div>
          )}

          {!loading && certificates.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                📜
              </div>
              <h2 className="text-2xl font-bold text-gray-800">No Certificates Earned Yet</h2>
              <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
                Attend college events and complete attendance to receive official verified certificates.
              </p>
              <button
                onClick={() => navigate("/student-events")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition"
              >
                Explore Upcoming Events
              </button>
            </div>
          )}

          {!loading && certificates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col justify-between hover:shadow-xl transition group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                        <Award size={26} />
                      </div>
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={13} />
                        Verified
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                      {cert.event?.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Issued on {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>

                    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
                      <p><strong>Recipient:</strong> {cert.user?.fullName}</p>
                      <p className="truncate font-mono text-[11px] text-gray-500">
                        <strong>Code:</strong> {cert.certificateCode}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Award size={14} />
                      View Certificate
                    </button>
                    <Link
                      to={"/verify-certificate/" + cert.certificateCode}
                      className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 p-2 rounded-xl transition"
                      title="Verify Online"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-amber-400" />
                <span className="font-bold text-sm">Official Certificate Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer size={14} />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-2 hover:bg-gray-800 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-8 md:p-12 bg-[#fdfbf7] border-8 border-[#d4af37] m-4 md:m-6 rounded-2xl relative text-center shadow-inner">
              <div className="mb-6">
                <div className="text-sm font-bold tracking-widest text-[#996515] uppercase">
                  {selectedCert.event?.college?.name || "CampusConnect College"}
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-gray-900 mt-2 tracking-wide">
                  Certificate of Participation
                </h2>
                <div className="w-24 h-1 bg-[#d4af37] mx-auto mt-4 rounded-full"></div>
              </div>

              <div className="my-8 space-y-4">
                <p className="text-sm uppercase tracking-wider text-gray-500 font-medium">This is proudly presented to</p>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 underline decoration-[#d4af37] decoration-2 underline-offset-8">
                  {selectedCert.user?.fullName}
                </h3>
                <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed pt-2">
                  for successfully attending and participating in the college event{" "}
                  <strong className="text-gray-900">"{selectedCert.event?.title}"</strong> held at{" "}
                  <span className="text-gray-800">{selectedCert.event?.venue}</span> on{" "}
                  <span className="text-gray-800">
                    {new Date(selectedCert.event?.eventDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-[#e2d5be] flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Certificate ID</p>
                  <p className="font-mono text-xs font-bold text-gray-800 mt-0.5">{selectedCert.certificateCode}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Issue Date: {new Date(selectedCert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#d4af37] p-1 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#d4af37]/10 flex flex-col items-center justify-center text-center">
                      <ShieldCheck size={18} className="text-[#996515]" />
                      <span className="text-[8px] font-extrabold text-[#996515] uppercase tracking-tighter">VERIFIED</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Official Seal</p>
                    <p className="text-[10px] text-gray-500">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}