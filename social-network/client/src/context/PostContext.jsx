import { createContext, useContext, useState, useEffect  } from "react";
import { getAllPosts, getUserPosts } from '~/api/post';
import { useUser } from "~/context/UserContext";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const { user } = useUser(); // Lấy user từ UserContext
    

    const updatePostLike = (postId, isLiked, likesCount) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, isLiked, likesCount }
                    : post
            )
        );
    };  

    const updatePostData = (updatedData) => {
      console.log("dữ liệu nhận được:", updatedData);
      const updatedPost = {
        ...updatedData.post,
        isLiked: updatedData.isLiked,
        likes: updatedData.likes,
        likesCount: updatedData.likesCount,
        comments: updatedData.comments,
        totalComments: updatedData.totalComments,
        ownerProfile: updatedData.ownerProfile
      };
    
      // Nếu bài viết là mới, thêm vào đầu danh sách
      if (!posts.some(post => post._id === updatedPost._id)) {
        setPosts(prevPosts => {
          console.log('Thêm bài viết mới vào đầu:', updatedPost);
          return [updatedPost, ...prevPosts];
      });
      } else {
        // Cập nhật bài viết hiện tại trong danh sách
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === updatedPost._id
              ? { ...post, ...updatedPost }
              : post
          )
        );
      }
    };

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const res = await getAllPosts();
          setPosts(res.data.map(post => ({
            ...post,
            likesCount: post.likes?.length || 0,
          })));
        } catch (err) {
          console.error("Lỗi khi load bài viết:", err);
        }
      };
      fetchPosts();
    }, [user]);

    const fetchUserPosts = async (userId) => {
    try {
      const res = await getUserPosts(userId);
      const userPosts = res.data.map(post => ({
        ...post,
        likesCount: post.likes?.length || 0,
      }));

      setPosts(prev => {
        // Loại bỏ các bài viết cũ của user đó (nếu cần)
        const filtered = prev.filter(post => post.userId._id !== userId);
        return [...filtered, ...userPosts];
      });
    } catch (err) {
      console.error('Lỗi khi load bài viết của user:', err);
    }
  };

  return (
    <PostContext.Provider value={{ posts, setPosts  ,updatePostLike , updatePostData, fetchUserPosts }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);