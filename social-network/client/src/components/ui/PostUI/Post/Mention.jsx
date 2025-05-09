// Mention.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getReplyProfile } from "~/api/post"; // điều chỉnh đường dẫn nếu cần

export default function Mention({ commentId, fallbackName }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    getReplyProfile(commentId)
      .then(p => {
        if (mounted) setProfile(p);
      })
      .catch(err => {
        console.error("Lỗi khi load profile mention:", err);
      });
    return () => {
      mounted = false;
    };
  }, [commentId]);

  const nameToShow = profile?.fullName || fallbackName;
  const toSlug = profile ? `/${profile.slug}` : "#";

  return (
    <Link to={toSlug} className="text-[#c8d7e4] hover:underline">
      @{nameToShow}
    </Link>
  );
}
