import { createContext, useContext, useState } from "react";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);

    const updatePostLike = (postId, isLiked, likesCount) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, isLiked, likesCount }
                    : post
            )
        );
    };  

  return (
    <PostContext.Provider value={{ posts, updatePostLike   }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext);