import { Link } from "react-router-dom";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummyData";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../constants/url";
import UseFollow from "../../hooks/UseFollow";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/users/suggested`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  if (suggestedUsers?.length === 0) {
    return <div className="md:w-64 w-0"></div>;
  }

  const { follow, isPending } = UseFollow();
  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#0a0a0ad6]  p-4 rounded-md sticky top-2">
        <p className="font-bold mb-4">Who to follow</p>
        <div className="flex flex-col gap-4">
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            suggestedUsers?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-1"
                key={user._id}
              >
                <div className="flex gap-4 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullName}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300 rounded-full btn-sm"
                    onClick={(e) => {
                      (e.preventDefault(), follow(user._id));
                    }}
                  >
                    {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
