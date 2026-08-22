import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

function AdminStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ======================================================
  // FETCH STUDENTS
  // ======================================================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API}/events/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("STUDENTS RESPONSE:", response.data);

      if (response.data.success) {
        setStudents(response.data.students || []);
      } else {
        alert(
          response.data.message ||
            "Failed to load students."
        );
      }
    } catch (error) {
      console.error(
        "FETCH STUDENTS ERROR:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        alert(
          "Access denied. Admin privileges required."
        );

        navigate("/admin-dashboard");
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD STUDENTS
  // ======================================================

  useEffect(() => {
    fetchStudents();
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredStudents = students.filter(
    (student) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        student.fullName
          ?.toLowerCase()
          .includes(searchText) ||
        student.email
          ?.toLowerCase()
          .includes(searchText) ||
        student.department
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-blue-600">
            CampusConnect
          </h1>

          <p className="text-sm text-gray-500">
            Admin Panel
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              navigate("/admin-dashboard")
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
          >
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
          >
            Logout
          </button>

        </div>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="p-8">

        <div className="max-w-7xl mx-auto">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-gray-800">
              Student Management
            </h1>

            <p className="text-gray-600 mt-2">
              View registered students and their
              event registrations.
            </p>

          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white rounded-xl shadow-md p-6">

              <div className="text-4xl mb-3">
                👨‍🎓
              </div>

              <p className="text-gray-500">
                Total Students
              </p>

              <h2 className="text-3xl font-bold text-gray-800 mt-1">
                {students.length}
              </h2>

            </div>

            <div className="bg-white rounded-xl shadow-md p-6">

              <div className="text-4xl mb-3">
                📋
              </div>

              <p className="text-gray-500">
                Total Registrations
              </p>

              <h2 className="text-3xl font-bold text-gray-800 mt-1">
                {students.reduce(
                  (total, student) =>
                    total +
                    (student.registrationCount || 0),
                  0
                )}
              </h2>

            </div>

            <div className="bg-white rounded-xl shadow-md p-6">

              <div className="text-4xl mb-3">
                🔍
              </div>

              <p className="text-gray-500">
                Students Shown
              </p>

              <h2 className="text-3xl font-bold text-gray-800 mt-1">
                {filteredStudents.length}
              </h2>

            </div>

          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">

            <label className="block font-semibold text-gray-700 mb-2">
              Search Students
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, email or department..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">

              <p className="text-gray-600 text-lg">
                Loading students...
              </p>

            </div>
          )}

          {/* ==================================================
              NO STUDENTS
          ================================================== */}

          {!loading &&
            students.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">

                <div className="text-6xl mb-4">
                  👨‍🎓
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  No Students Found
                </h2>

                <p className="text-gray-600 mt-2">
                  No students are currently
                  registered in CampusConnect.
                </p>

              </div>
            )}

          {/* ==================================================
              SEARCH RESULT EMPTY
          ================================================== */}

          {!loading &&
            students.length > 0 &&
            filteredStudents.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">

                <div className="text-5xl mb-4">
                  🔍
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  No Matching Students
                </h2>

                <p className="text-gray-600 mt-2">
                  Try searching with another
                  name, email or department.
                </p>

              </div>
            )}

          {/* ==================================================
              STUDENT TABLE
          ================================================== */}

          {!loading &&
            filteredStudents.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead className="bg-gray-50 border-b">

                      <tr>

                        <th className="text-left px-6 py-4 font-semibold text-gray-700">
                          Student
                        </th>

                        <th className="text-left px-6 py-4 font-semibold text-gray-700">
                          Department
                        </th>

                        <th className="text-left px-6 py-4 font-semibold text-gray-700">
                          Year
                        </th>

                        <th className="text-left px-6 py-4 font-semibold text-gray-700">
                          Registrations
                        </th>

                        <th className="text-left px-6 py-4 font-semibold text-gray-700">
                          Joined
                        </th>

                        <th className="text-center px-6 py-4 font-semibold text-gray-700">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredStudents.map(
                        (student) => (
                          <tr
                            key={student.id}
                            className="border-b hover:bg-gray-50 transition"
                          >

                            {/* STUDENT */}

                            <td className="px-6 py-5">

                              <div className="font-semibold text-gray-800">
                                {student.fullName ||
                                  "Unknown Student"}
                              </div>

                              <div className="text-sm text-gray-500">
                                {student.email ||
                                  "No email"}
                              </div>

                            </td>

                            {/* DEPARTMENT */}

                            <td className="px-6 py-5 text-gray-700">

                              {student.department ||
                                "Not specified"}

                            </td>

                            {/* YEAR */}

                            <td className="px-6 py-5 text-gray-700">

                              {student.year
                                ? `Year ${student.year}`
                                : "Not specified"}

                            </td>

                            {/* REGISTRATIONS */}

                            <td className="px-6 py-5">

                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">

                                {student.registrationCount ||
                                  0}

                              </span>

                            </td>

                            {/* CREATED DATE */}

                            <td className="px-6 py-5 text-gray-700">

                              {formatDate(
                                student.createdAt
                              )}

                            </td>

                            {/* ACTION */}

                            <td className="px-6 py-5 text-center">

                              <button
                                onClick={() =>
                                  setSelectedStudent(
                                    student
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                              >
                                View
                              </button>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

        </div>

      </main>

      {/* ==================================================
          STUDENT DETAILS MODAL
      ================================================== */}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex justify-between items-center p-6 border-b">

              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  Student Details
                </h2>

                <p className="text-gray-500 mt-1">
                  {selectedStudent.fullName}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="text-gray-500 hover:text-gray-800 text-3xl"
              >
                ×
              </button>

            </div>

            {/* STUDENT INFORMATION */}

            <div className="p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Full Name
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedStudent.fullName ||
                      "Not available"}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="font-semibold text-gray-800 mt-1 break-all">
                    {selectedStudent.email ||
                      "Not available"}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Department
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedStudent.department ||
                      "Not specified"}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Year
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedStudent.year
                      ? `Year ${selectedStudent.year}`
                      : "Not specified"}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Registered Events
                  </p>

                  <p className="font-semibold text-blue-600 text-xl mt-1">
                    {selectedStudent.registrationCount ||
                      0}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Joined CampusConnect
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {formatDate(
                      selectedStudent.createdAt
                    )}
                  </p>

                </div>

              </div>

              {/* REGISTERED EVENTS */}

              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Registered Events
              </h3>

              {!selectedStudent.registrations ||
                selectedStudent.registrations.length ===
                  0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">

                  <div className="text-4xl mb-2">
                    📅
                  </div>

                  <p className="text-gray-600">
                    This student has not registered
                    for any events yet.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {selectedStudent.registrations.map(
                    (registration) => {

                      const event =
                        registration.event;

                      return (
                        <div
                          key={registration.id}
                          className="border rounded-lg p-4"
                        >

                          <div className="flex justify-between items-start gap-4">

                            <div>

                              <h4 className="font-bold text-lg text-gray-800">
                                {event?.title ||
                                  "Unknown Event"}
                              </h4>

                              <p className="text-gray-600 mt-1">
                                📍{" "}
                                {event?.venue ||
                                  "Venue not available"}
                              </p>

                              <p className="text-gray-600 mt-1">
                                📅{" "}
                                {formatDate(
                                  event?.eventDate
                                )}
                              </p>

                            </div>

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              {event?.status ||
                                "UPCOMING"}
                            </span>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t p-6 flex justify-end">

              <button
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg font-semibold"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminStudents;