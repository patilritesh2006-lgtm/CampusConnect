import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
        <h1 className="text-7xl font-extrabold text-blue-600">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 text-sm">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg text-sm transition"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition"
          >
            <Home size={16} />
            CampusConnect Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
