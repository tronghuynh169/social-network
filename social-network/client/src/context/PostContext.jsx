import { createContext, useContext, useState, useEffect  } from "react";
import { getAllPosts, getUserPosts } from '~/api/post';
import { useUser } from "~/context/UserContext";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const { user } = useUser(); // Lấy user từ UserContext
    const [userPosts, setUserPosts] = useState([]);
    const [loadingUserPosts, setLoadingUserPosts] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postCount, setPostCount] = useState(0);
    // state mới: map từ userId → mảng posts
    const [userPostsMap, setUserPostsMap] = useState({});
    const [loadingUserPostsMap, setLoadingUserPostsMap] = useState({});

    const updatePostLike = (postId, isLiked, likesCount) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, isLiked, likesCount }
                    : post
            )
        );
        // 2) Cập nhật userPostsMap cho từng user đang có post này
        setUserPostsMap(prevMap => {
          const newMap = {};
          for (const [userId, arr] of Object.entries(prevMap)) {
            newMap[userId] = arr.map(post =>
              post._id === postId
                ? { ...post, isLiked, likesCount }
                : post
            );
          }
          return newMap;
        });
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
      // Update global feed
      if (!posts.some(post => post._id === updatedPost._id)) {
        setPosts(prev => [updatedPost, ...prev]);
      } else {
        setPosts(prev =>
          prev.map(post =>
            post._id === updatedPost._id ? { ...post, ...updatedPost } : post
          )
        );
      }

      // B) Cập nhật userPostsMap cho đúng owner
      const ownerId = updatedPost.ownerProfile.userId.toString();
      setUserPostsMap(prevMap => {
        const arr = prevMap[ownerId] || [];

        // nếu mới, đưa lên đầu
        if (!arr.some(p => p._id === updatedPost._id)) {
          return {
            ...prevMap,
            [ownerId]: [updatedPost, ...arr]
          };
        }

        // nếu đã có, map để cập nhật
        return {
          ...prevMap,
          [ownerId]: arr.map(p =>
            p._id === updatedPost._id ? { ...p, ...updatedPost } : p
          )
        };
      });
    };

    const removePostData = (postId) => {
    // A) Xóa khỏi feed toàn cục
    setPosts(prev => prev.filter(p => p._id !== postId));

    // B) Xóa khỏi tất cả userPostsMap
    setUserPostsMap(prevMap => {
      const newMap = {};
      for (const [uid, arr] of Object.entries(prevMap)) {
        newMap[uid] = arr.filter(p => p._id !== postId);
      }
      return newMap;
    });
  };

    useEffect(() => {
      const fetchPosts = async () => {
        setLoadingPosts(true); // bắt đầu loading
        try {
          const res = await getAllPosts();
          setPosts(res.data.map(post => ({
            ...post,
            likesCount: post.likes?.length || 0,
          })));
        } catch (err) {
          console.error("Lỗi khi load bài viết:", err);
        } finally {
          setLoadingPosts(false); // kết thúc loading
        }
      };
      fetchPosts();
    }, [user]);

    const fetchUserPosts = async (userId) => {
    // đánh dấu loading riêng cho mỗi userId
    setLoadingUserPostsMap(m => ({ ...m, [userId]: true }));
    try {
      const res = await getUserPosts(userId);
      const arr = res.data.map(p => ({ ...p, likesCount: p.likes?.length||0 }));
      setUserPostsMap(m => ({ ...m, [userId]: arr }));
    } catch (e) {
      console.error('Lỗi khi load bài của user', userId, e);
    } finally {
      setLoadingUserPostsMap(m => ({ ...m, [userId]: false }));
    }
  };

  // helper lấy posts cho từng user
  const getUserPostsById = (userId) => userPostsMap[userId] || [];

  return (
    <PostContext.Provider value={{ 
      posts, 
      setPosts,
      updatePostLike, 
      updatePostData, 
      fetchUserPosts, 
      userPosts, 
      setUserPosts,
      loadingUserPosts, 
      loadingPosts, 
      postCount,
      getUserPostsById,
      loadingUserPostsMap,
      removePostData
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);