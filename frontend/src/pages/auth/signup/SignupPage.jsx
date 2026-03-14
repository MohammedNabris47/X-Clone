import { useState } from "react";
import XSvg from "../../../components/svgs/X";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { baseUrl } from "../../../constants/url";
import toast from "react-hot-toast";
const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ username, fullName, email, password }) => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/signup`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, username, fullName, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Failed to create account");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto flex h-screen ">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-10 flex gap-2 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-6xl font-extrabold text-white">Happening now</h1>
          <h3 className="text-3xl text-white font-bold">Join today.</h3>
          <label className="bg-transparent border border-gray-700 w-full  rounded flex items-center gap-2 p-2">
            <MdOutlineMail />
            <input
              type="email"
              value={formData.email}
              className="grow outline-0"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
            />
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="bg-transparent border border-gray-700 w-full  rounded flex items-center gap-2 p-2">
              <FaUser />
              <input
                type="text"
                value={formData.username}
                className="grow outline-0"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
              />
            </label>
            <label className="bg-transparent border border-gray-700 w-full  rounded flex items-center gap-2 p-2">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                value={formData.fullName}
                className="grow outline-0"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
              />
            </label>
          </div>
          <label className="bg-transparent border border-gray-700 w-full  rounded flex items-center gap-2 p-2">
            <MdPassword />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              className="grow outline-0"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-white cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
            </button>
          </label>

          <button className="btn rounded-full bg-transparent outline-0 border border-gray-700 text-white font-semibold hover:bg-white hover:text-black transition-colors duration-300">
            {isPending ? "Loading..." : "Sign Up"}
          </button>
          {isError && <p className="text-white text-xs">{error.message}</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-3">
          <p className="text-white text-sm">Already have an account?</p>
          <Link to={"/login"}>
            <button className="btn rounded-full bg-transparent outline-0 border border-gray-700 text-white font-semibold hover:bg-white hover:text-black transition-colors duration-300 w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
