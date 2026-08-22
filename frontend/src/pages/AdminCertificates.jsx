import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import AppNavbar from "../components/AppNavbar";
import { Award, Search, ExternalLink, ShieldCheck } from "lucide-react";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await API.get("/certificates/all");
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      console.error("Fetch all certs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filtered = certificates.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.certificateCode?.toLowerCase().includes(q) ||
      c.user?.fullName?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.event?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNavbar role="ADMIN" />

      <main className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-1">
                <Award size={18} />
                Credential Registry
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Issued Certificates</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage, audit, and verify all generated student credentials and verification codes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/verify-certificate"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <ShieldCheck size={16} />
                Public Verification Tool
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-amber-500">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Issued</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{certificates.length}</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 md:col-span-3 flex items-center">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student name, email, event, or certificate ID..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Loading certificate registry...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase">
                    <tr>
                      <th className="px-6 py-4">Certificate ID</th>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Event</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No certificates match your search query.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-mono font-bold text-amber-700">{c.certificateCode}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{c.user?.fullName}</div>
                            <div className="text-xs text-gray-500">{c.user?.email}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{c.event?.title}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(c.issueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={"/verify-certificate/" + c.certificateCode}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                            >
                              Verify <ExternalLink size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}