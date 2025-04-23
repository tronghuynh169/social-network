import { createContext, useContext, useState, useEffect  } from "react";
import { getAllPosts } from '~/api/post';

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

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const res = await getAllPosts();
          setPosts(res.data);
        } catch (err) {
          console.error("Lỗi khi load bài viết:", err);
        }
      };
      fetchPosts();
    }, []);

  return (
    <PostContext.Provider value={{ posts, setPosts  ,updatePostLike   }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);