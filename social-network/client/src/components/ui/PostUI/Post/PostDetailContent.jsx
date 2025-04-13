const PostDetailContent = ({ post, comments, likes }) => {
    return (
        <div className="flex h-full">
            {/* Phần ảnh */}
            <div className="flex-1 bg-black flex justify-center items-center">
                <img src={post.mediaUrls[0]} alt="post" className="max-h-full object-contain" />
            </div>

            {/* Phần thông tin */}
            <div className="flex-1 p-4 flex flex-col">
                {/* Người đăng */}
                <div className="flex items-center gap-2 mb-4">
                    <img src={post.userId.profilePicture} alt="" className="w-10 h-10 rounded-full" />
                    <span className="font-semibold">{post.userId.username}</span>
                </div>

                {/* Caption */}
                <div className="mb-4">
                    <p>{post.caption}</p>
                </div>

                {/* Comments */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {comments.map((comment) => (
                        <div key={comment._id} className="flex items-start gap-2">
                            <img src={comment.userId.profilePicture} className="w-8 h-8 rounded-full" />
                            <div>
                                <span className="font-semibold">{comment.userId.username}</span>{" "}
                                {comment.content}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="border-t mt-4 pt-4">
                    <span className="font-semibold text-sm">{likes.length} lượt thích</span>
                </div>
            </div>
        </div>
    );
};

export default PostDetailContent;

