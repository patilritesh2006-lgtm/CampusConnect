import { BrowserRouter, Routes, Route } from "react-router-dom";


import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";


import ProtectedRoute from "./components/ProtectedRoute";



function App() {


  return (

    <BrowserRouter>

      <Routes>


        <Route 
          path="/" 
          element={<Home />} 
        />


        <Route 
          path="/login" 
          element={<Login />} 
        />



        <Route

          path="/student-dashboard"

          element={

            <ProtectedRoute role="student">

              <StudentDashboard />

            </ProtectedRoute>

          }

        />



        <Route

          path="/admin-dashboard"

          element={

            <ProtectedRoute role="admin">

              <AdminDashboard />

            </ProtectedRoute>

          }

        />



      </Routes>


    </BrowserRouter>

  );

}


export default App;