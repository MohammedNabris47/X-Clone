import { useState } from "react";
import CreatePost from "./CreatePost";
import Posts from "../../components/common/Posts";
const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  return (
    <div className="flex-[4_4_0] mr-auto border-r border-gray-800 min-h-screen">
      <div className="flex w-full border-b border-gray-800">
        <div
          className={
            "flex flex-1 justify-center p-2 hover:bg-[#0a0a0ad6] transition duration-300 cursor-pointer relative"
          }
          onClick={() => setFeedType("forYou")}
        >
          For you
          {feedType === "forYou" && (
            <div className="absolute bottom-0 w-10  h-1 rounded-full bg-white">
              {" "}
            </div>
          )}
        </div>
        <div
          className={
            "flex flex-1 justify-center p-2 hover:bg-[#0a0a0ad6] transition duration-300 cursor-pointer relative"
          }
          onClick={() => setFeedType("following")}
        >
          Following
          {feedType === "following" && (
            <div className="absolute bottom-0 w-10  h-1 rounded-full bg-white">
              {" "}
            </div>
          )}
        </div>
      </div>

      <CreatePost />
      <Posts feedType={feedType} />
    </div>
  );
};

export default HomePage;
