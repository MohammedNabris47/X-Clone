import toast from "react-hot-toast";
import { baseUrl } from "../constants/url";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const UseUpdateProfile = (options = {}) => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        try {
          const res = await fetch(`${baseUrl}/api/users/update`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to fetch authenticated user");
          }
          return data;
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      onSuccess: (data) => {
        toast.success("Profile Updated Successfully");
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        ]);
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  return { updateProfile, isUpdatingProfile };
};

export default UseUpdateProfile;
