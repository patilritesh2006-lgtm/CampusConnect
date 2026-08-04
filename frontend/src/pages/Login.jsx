import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function Login() {

  const navigate = useNavigate();


  const [role, setRole] = useState("student");


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });



  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };




  const handleLogin = async (e) => {

    e.preventDefault();


    try {


      const response = await axios.post(

        "http://localhost:5000/api/auth/login",

        {
          email: formData.email,
          password: formData.password,
        }

      );



      if(response.data.success){


        // Store JWT Token
        localStorage.setItem(
          "token",
          response.data.token
        );



        // Store User Data
        localStorage.setItem(

          "user",

          JSON.stringify(response.data.user)

        );



        // Redirect according to role

        if(response.data.user.role === "admin"){

          navigate("/admin-dashboard");

        }
        else{

          navigate("/student-dashboard");

        }


      }



    }
    catch(error){


      alert(

        error.response?.data?.message ||

        "Login Failed"

      );


    }


  };





  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">


      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">


        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">

          CampusConnect

        </h1>



        <h2 className="text-xl font-semibold text-center mb-5">

          Login

        </h2>





        {/* Role Selection */}

        <div className="flex gap-4 mb-5">


          <button

            type="button"

            onClick={() => setRole("student")}

            className={`w-1/2 py-2 rounded-lg ${
              role === "student"

              ? "bg-blue-600 text-white"

              : "bg-gray-200"

            }`}

          >

            Student

          </button>




          <button

            type="button"

            onClick={() => setRole("admin")}

            className={`w-1/2 py-2 rounded-lg ${
              role === "admin"

              ? "bg-blue-600 text-white"

              : "bg-gray-200"

            }`}

          >

            Admin

          </button>


        </div>





        <form onSubmit={handleLogin}>


          <label className="block mb-2">

            Email

          </label>



          <input

            type="email"

            name="email"

            value={formData.email}

            onChange={handleChange}

            placeholder="Enter email"

            className="w-full border p-3 rounded-lg mb-4"

            required

          />





          <label className="block mb-2">

            Password

          </label>




          <input

            type="password"

            name="password"

            value={formData.password}

            onChange={handleChange}

            placeholder="Enter password"

            className="w-full border p-3 rounded-lg mb-5"

            required

          />





          <button

            type="submit"

            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"

          >

            Login

          </button>



        </form>





        <p className="text-center mt-5 text-gray-600">

          New student? Register here

        </p>



      </div>


    </div>

  );

}


export default Login;