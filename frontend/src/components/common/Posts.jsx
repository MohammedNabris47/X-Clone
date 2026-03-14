import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../constants/url";

import PostSkeleton from "../skeletons/PostSkeleton";
import Post from "./Post";
import { useEffect } from "react";

const Posts = ({ feedType = "forYou", username, userId }) => {
  const getPostsEndPoint = () => {
    switch (feedType) {
      case "forYou":
        return `${baseUrl}/api/posts/all`;

      case "following":
        return `${baseUrl}/api/posts/following`;
      case "posts":
        return `${baseUrl}/api/posts/user/${username || ""}`;
      case "likes":
        return `${baseUrl}/api/posts/likes/${userId || ""}`;
      default:
        return `${baseUrl}/api/posts/all`;
    }
  };

  const POST_ENDPOINTS = getPostsEndPoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINTS, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.status === 404) return []; // User not found, return empty posts
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.posts)) return data.posts;
        if (Array.isArray(data.likedPosts)) return data.likedPosts;
        if (Array.isArray(data.userPosts)) return data.userPosts;
        return [];
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);
  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
