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

    const updatePostLike = (postId, isLiked, likesCount) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, isLiked, likesCount }
                    : post
            )
        );
        setUserPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId ? { ...post, isLiked, likesCount } : post
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
        if (user?.id?.toString() === updatedPost.userId?.toString()) {
          setUserPosts(prevPosts => [updatedPost, ...prevPosts]);
        }
      } else {
        // Cập nhật bài viết hiện tại trong danh sách
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === updatedPost._id
              ? { ...post, ...updatedPost }
              : post
          )
        );
        if (user?.id === updatedPost.ownerProfile.userId) {
            setUserPosts(prevPosts =>
              prevPosts.map(post =>
                post._id === updatedPost._id
                  ? { ...post, ...updatedPost }
                  : post
              )
            );
        }
      }
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
      setLoadingUserPosts(true); // bắt đầu loading
      setUserPosts([]);  // Reset userPosts khi bắt đầu fetch bài viết mới
    try {
      const res = await getUserPosts(userId);
      const userPosts = res.data.map(post => ({
        ...post,
        likesCount: post.likes?.length || 0,
      }));

      setUserPosts(userPosts);
      setPostCount(userPosts.length);
    } catch (err) {
      console.error('Lỗi khi load bài viết của user:', err);
    } finally {
      setLoadingUserPosts(false); // kết thúc loading
    }
  };

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
      postCount  
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);