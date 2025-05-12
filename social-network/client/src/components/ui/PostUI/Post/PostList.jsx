import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { usePosts } from '~/context/PostContext';

export default function PostList() {
  const { posts, setPosts } = usePosts();

  const handleLikeUpdate = (postId, update) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post._id === postId ? {
        ...post,
        isLiked: update.isLiked,
        likesCount: update.likesCount
      } : post
    ));
  };

  return (
    <div className="space-y-8">
      {posts.map((post) => 
          <PostCard key={post._id} post={post} onLikeUpdated={handleLikeUpdate} />
      )}
    </div>
  );
}
