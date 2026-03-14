import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { baseUrl } from "../../constants/url";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import UseUpdateProfile from "../../hooks/UseUpdateProfile";

const EditProfileModal = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });
  //const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) return null;
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to fetch authenticated user");
        return data.user || null;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const { updateProfile, isUpdatingProfile } = UseUpdateProfile({
    onSuccess: (data) => {
      const updatedUsername = data?.user?.username;
      if (updatedUsername) {
        navigate(`/profile/${updatedUsername}`);
      }
      const modal = document.getElementById("edit_profile_modal");
      if (modal) modal.close();
    },
  });
  //   mutationFn: async ({ formData }) => {
  //     try {
  //       const res = await fetch(`${baseUrl}/api/users/update`, {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       });
  //       const data = await res.json();
  //       if (!res.ok) {
  //         throw new Error(data.error || "Failed to fetch authenticated user");
  //       }
  //       return data;
  //     } catch (error) {
  //       console.error(error);
  //       throw error;
  //     }
  //   },
  //   onSuccess: () => {
  //     toast.success("Profile Updated Successfully");
  //     Promise.all([
  //       queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  //       queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
  //     ]);
  //   },
  //   onError: (error) => {
  //     toast.error(error.message);
  //   },
  // });
  //const { updateProfile, isUpdatingProfile } = UseUpdateProfile();
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName,
        username: authUser.username,
        link: authUser.link,
        bio: authUser.bio,
        email: authUser.email,
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [authUser]);

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box bg-black rounded-md  shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile(formData);
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 outline-0 bg-transparent rounded p-2 input-md"
                value={formData.fullName}
                name="fullName"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md outline-0 bg-transparent "
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md outline-0 bg-transparent "
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md outline-0 bg-transparent "
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md outline-0 bg-transparent "
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
              />
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md outline-0 bg-transparent "
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md outline-0 bg-transparent "
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />
            <button className="btn bg-transparent hover:bg-white hover:text-black duration-300 rounded-full btn-sm text-white">
              {isUpdatingProfile && <LoadingSpinner size="sm" />}
              {!isUpdatingProfile && "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};

export default EditProfileModal;
