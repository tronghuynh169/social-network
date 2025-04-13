import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPostDetails } from "~/api/post";
import PostDetailContent from "~/components/ui/PostUI/Post/PostDetailContent";

const PostDetailModal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [postData, setPostData] = useState(null);

    useEffect(() => {
        getPostDetails(id).then((res) => setPostData(res.data));
    }, [id]);

    if (!postData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white max-w-5xl w-full h-[90vh] rounded-xl shadow-lg relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-3 right-3 text-gray-600 hover:text-black"
                >
                    ✕
                </button>
                <PostDetailContent post={postData.post} comments={postData.comments} likes={postData.likes} />
            </div>
        </div>
    );
};

export default PostDetailModal;
