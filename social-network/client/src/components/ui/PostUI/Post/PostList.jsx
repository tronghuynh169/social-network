import React, { useEffect, useState } from 'react';
import { getAllPosts } from '~/api/post';
import PostCard from './PostCard';

export default function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getAllPosts();
        setPosts(res.data);
      } catch (err) {
        console.error('Lỗi khi load bài viết:', err);
      }
    };
    fetchPosts();
  }, []);

  

  return (
    <div className="space-y-8">
      {posts.map((post) => 
          <PostCard key={post._id} post={post} />
      )}
    </div>
  );
}
