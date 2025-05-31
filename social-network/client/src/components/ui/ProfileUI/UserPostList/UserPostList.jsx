import React, { useEffect } from 'react';
import { usePosts } from '~/context/PostContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Copy, MessageCircle, Loader, CameraOff   } from 'lucide-react';

export default function UserPostList({ userId }) {
    const {
        fetchUserPosts,
        getUserPostsById,
        loadingUserPostsMap,
        refreshPostsIfNeeded,   
        postsToRefresh           
    } = usePosts();

    const navigate = useNavigate();
    const location = useLocation();

    const userPosts = getUserPostsById(userId);
    const loading = loadingUserPostsMap[userId];

    useEffect(() => {
        if (userId) {
            fetchUserPosts(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (!userPosts || userPosts.length === 0) return;

        // Lấy tập ID của userPosts
        const userPostIds = new Set(userPosts.map(p => p._id));
        // Kiểm tra xem có post nào trong postsToRefresh trùng hay không
        const intersection = Array.from(postsToRefresh).filter(id => userPostIds.has(id));
        if (intersection.length > 0) {
        // Gọi hàm refresh để cập nhật cả comment, likesCount, etc.
        refreshPostsIfNeeded();
        }
        // Chỉ chạy mỗi khi postsToRefresh thay đổi
    }, [postsToRefresh]);


    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`, {
            state: {
                backgroundLocation: location.pathname,
            },
        });
    };

    if (loading) {
    return (
        <div className="flex justify-center items-center py-10">
        <Loader className="animate-spin w-8 h-8 text-gray-500" />
        </div>
    );
    }

    return (
        <div className="w-full">
            {userPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-12 text-[var(--text-primary-color)]">
                <CameraOff className="w-12 h-12 mb-6" />
                <p className="">Người dùng chưa đăng bài viết nào.</p>
            </div>
            ) :
            (
            <div className="grid grid-cols-3 gap-[2px] sm:gap-1 md:gap-2">
                {userPosts.map(post => {
                    const likesCount = post.likesCount || 0;
                    const liked = post.isLiked;  // lấy isLiked từ từng post
                    const comments = post.comments || [];
                    return (
                    <div
                        key={post._id}
                        onClick={() => handlePostClick(post._id)}
                        className="relative w-full aspect-[4/5] overflow-hidden group cursor-pointer"
                    >
                        {post.media && post.media.length > 0 ? (
                            <>
                                <img
                                    src={`http://localhost:5000${post.media[0].url}`}
                                    alt="post"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-100"
                                />

                                {/* Icon nhiều media */}
                                {post.media.length > 1 && (
                                    <Copy size={18} className="absolute top-1.5 right-1.5 text-white opacity-90 rotate-[180deg]"/>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-90 flex items-center justify-center transition-opacity">
                                    <div className="flex items-center gap-8 text-white text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Heart className={`w-6 h-6 ${liked ? "fill-current text-red-500" : ""}`} />
                                            <span>{likesCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="w-6 h-6"/>
                                            <span>
                                                {comments.reduce((acc, comment) => {
                                                    return acc + 1 + countRepliesRecursive(comment.replies || []);
                                                    }, 0
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center w-full h-full px-2 text-sm text-center text-white bg-[var(--secondary-color)] transition-transform duration-100">
                                    {post.caption?.slice(0, 100) || 'Không có nội dung'}
                                </div>

                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-90 flex items-center justify-center transition-opacity">
                                    <div className="flex items-center gap-8 text-white text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Heart className={`w-6 h-6 ${liked ? "fill-current text-red-500" : ""}`} />
                                            <span>{likesCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="w-6 h-6"/>
                                            <span>
                                                {comments.reduce((acc, comment) => {
                                                    return acc + 1 + countRepliesRecursive(comment.replies || []);
                                                    }, 0
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                            
                        )}
                    </div>
                )})}
            </div>
            )}
        </div>
    );
}

const countRepliesRecursive = (replies) => {
  if (!replies || replies.length === 0) return 0;

  return replies.reduce((acc, reply) => {
    return acc + 1 + countRepliesRecursive(reply.replies || []);
  }, 0);
};
