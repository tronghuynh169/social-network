import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';
import {  Loader   } from 'lucide-react';
import { usePosts } from '~/context/PostContext';

export default function PostList() {
  const { posts, setPosts, loadingPosts, refreshPostsIfNeeded, postsToRefresh  } = usePosts();

    useEffect(() => {
      refreshPostsIfNeeded();
    }, [postsToRefresh]);


  const handleLikeUpdate = (postId, update) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post._id === postId ? {
        ...post,
        isLiked: update.isLiked,
        likesCount: update.likesCount
      } : post
    ));
  };

  if (loadingPosts) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => 
          <PostCard key={post._id} post={post} onLikeUpdated={handleLikeUpdate} />
      )}
    </div>
  );
}
