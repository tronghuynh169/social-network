import { createContext, useContext, useState, useEffect  } from "react";
import { getAllPosts, getUserPosts, getUserPostCount as fetchPostCountFromServer, getPostDetails } from '~/api/post';
import { useUser } from "~/context/UserContext";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const { user } = useUser(); // Lấy user từ UserContext
    const [loadingUserPosts, setLoadingUserPosts] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postCounts, setPostCounts] = useState({});
    // state mới: map từ userId → mảng posts
    const [userPostsMap, setUserPostsMap] = useState({});
    const [loadingUserPostsMap, setLoadingUserPostsMap] = useState({});

    const [postsToRefresh, setPostsToRefresh] = useState(new Set());

      // Đánh dấu cần refresh post
    const markPostNeedsRefresh = (postId) => {
      setPostsToRefresh(prev => new Set(prev).add(postId));
    };

    // Cập nhật lại các bài viết đã đánh dấu
    // Trong PostContext, thay đổi hàm refreshPostsIfNeeded như sau
    const refreshPostsIfNeeded = async () => {
      // Nếu không có postId nào trong set thì thôi
      if (postsToRefresh.size === 0) return;

      try {
        // 1) Fetch chi tiết cho từng postId được đánh dấu
        const updatedPosts = await Promise.all(
          Array.from(postsToRefresh).map(async (postId) => {
            const res = await getPostDetails(postId);
            const { post, isLiked, likesCount, comments, totalComments, ownerProfile } = res.data;

            // Build object updatedPost đầy đủ
            return {
              ...post,            // _id, userId, caption, media, visibility, createdAt, __v, isLiked (nhưng ta sẽ ghi đè lại)
              isLiked: isLiked,   // user hiện tại đã like hay chưa
              likesCount: likesCount,       // ví dụ 1
              likes: res.data.likes,        // mảng chi tiết người like (nếu cần)
              comments: comments || [],     // mảng comment (nếu không có thì đặt rỗng)
              totalComments: totalComments || 0, // tổng số comment
              ownerProfile: ownerProfile,   // thông tin profile của chủ post
            };
          })
        );

        // 2) Cập nhật lên feed chính (posts)
        setPosts(prev =>
          prev.map(p => {
            const updated = updatedPosts.find(up => up._id === p._id);
            return updated ? { ...p, ...updated } : p;
          })
        );

        // 3) Cập nhật lên userPostsMap (nếu post này có trong mảng posts của user nào đó)
        setUserPostsMap(prevMap => {
          const newMap = {};
          for (const [userId, arr] of Object.entries(prevMap)) {
            newMap[userId] = arr.map(postItem => {
              const updated = updatedPosts.find(up => up._id === postItem._id);
              return updated ? { ...postItem, ...updated } : postItem;
            });
          }
          return newMap;
        });
      } catch (err) {
        console.error("Lỗi khi làm mới bài viết:", err);
      } finally {
        // Xóa hết danh sách sau khi đã refresh
        setPostsToRefresh(new Set());
      }
    };

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
        const arr = res.data.posts.map(p => ({ ...p, likesCount: p.likes?.length||0 }));
        setUserPostsMap(m => ({ ...m, [userId]: arr }));
        setPostCounts(m => ({ ...m, [userId]: res.data.totalPostCount })); // <- thêm dòng này
      } catch (e) {
        console.error('Lỗi khi load bài của user', userId, e);
      } finally {
        setLoadingUserPostsMap(m => ({ ...m, [userId]: false }));
      }
    };

    const refreshPostCount = async (userId) => {
      try {
        const response = await fetchPostCountFromServer(userId);
        const newCount = response;
        console.log(`✅ Post count mới của user ${userId}:`, newCount);
        setPostCounts(prev => ({ ...prev, [userId]: newCount }));
      } catch (err) {
        console.error("Lỗi khi refresh post count:", err);
      }
    };

    // helper lấy posts cho từng user
    const getUserPostsById = (userId) => userPostsMap[userId] || [];
    const getUserPostCount = (userId) => postCounts[userId] ?? 0;

    return (
    <PostContext.Provider value={{ 
      posts, 
      setPosts,
      updatePostLike, 
      updatePostData, 
      fetchUserPosts, 
      loadingUserPosts, 
      loadingPosts, 
      postCounts,
      setPostCounts,
      refreshPostCount,
      getUserPostCount,
      getUserPostsById,
      loadingUserPostsMap,
      removePostData,
      markPostNeedsRefresh,      
      refreshPostsIfNeeded,
      postsToRefresh  
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);