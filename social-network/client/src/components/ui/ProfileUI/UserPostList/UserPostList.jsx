import React, { useEffect } from 'react';
import { usePosts } from '~/context/PostContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function UserPostList({ userId }) {
    const { posts, fetchUserPosts } = usePosts();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (userId) {
            fetchUserPosts(userId);
        }
    }, [userId]);

    const userPosts = posts.filter(post => post.userId._id === userId);

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`, {
            state: {
                backgroundLocation: location.pathname,
            },
        });
    };

    return (
        <div className="max-w-4xl w-full px-6 mt-8">
            <div className="grid grid-cols-3 gap-[2px] sm:gap-1 md:gap-2">
                {userPosts.map(post => (
                    <div
                        key={post._id}
                        onClick={() => handlePostClick(post._id)}
                        className="relative aspect-[4/5] overflow-hidden group rounded-md cursor-pointer"
                    >
                        {post.media && post.media.length > 0 ? (
                            <>
                                <img
                                    src={`http://localhost:5000${post.media[0].url}`}
                                    alt="post"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <div className="flex items-center gap-1 text-white text-sm font-medium">
                                        <Heart size={16} className="text-red-500 fill-red-500" />
                                        <span>{post.likes.length}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full px-2 text-sm text-center text-white bg-zinc-700">
                                {post.caption?.slice(0, 100) || 'Không có nội dung'}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
