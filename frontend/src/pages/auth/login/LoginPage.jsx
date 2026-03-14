import { useState } from "react";
import XSvg from "../../../components/svgs/X";
import { MdPassword } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../../constants/url";
import toast from "react-hot-toast";
const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("User login successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Failed to login");
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
    <div className="max-w-7xl mx-auto flex h-screen px-8">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-3 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />

          <h3 className="text-3xl text-white font-bold">Let's go.</h3>
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
            {isPending ? "Loading..." : "Login"}
          </button>
          {isError && <p className="text-white text-xs">{error.message}</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-3">
          <p className="text-white text-sm">{"Don't"} have an account?</p>
          <Link to={"/signup"}>
            <button className="btn rounded-full bg-transparent outline-0 border border-gray-700 text-white font-semibold hover:bg-white hover:text-black transition-colors duration-300 w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
