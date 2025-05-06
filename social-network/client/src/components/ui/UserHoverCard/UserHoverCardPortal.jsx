import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import UserHoverCard from "./UserHoverCard"; // nhớ điều chỉnh path nếu khác
import { getProfileByUserId } from "~/api/profile";

const UserHoverCardPortal = ({ targetRef, user, hoverPosition, onMouseEnter, onMouseLeave, hoverCardRef, onFollowChange}) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [info, setInfo] = useState();

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      console.log("Rect:", rect);
      setCoords({
        top: rect.top + window.scrollY + 12,
        left: rect.left + window.scrollX + 10,
      });
    }
  }, [targetRef]);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (user.userId) {
            const res = await getProfileByUserId(user.userId);
            setInfo(res);
        } else {
          console.log("Không có userId hợp lệ.");
        }
      } catch (err) {
        console.error('Lỗi khi load bài viết:', err);
      }
    };
    fetchInfo();
  }, [user]); 

  return createPortal(
    info ? (
      <div
        onClick={(e) => e.stopPropagation()} // 👈 Thêm dòng này!
        ref={hoverCardRef}               // 👈 gắn ref để parent check contains()
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="absolute z-[9999]"
        style={{
          top: coords.top,
          left: coords.left,
          position: "absolute",
          pointerEvents: "auto",        // đảm bảo nó nhận pointer
        }}
      >
        <UserHoverCard 
            info={info} 
            hoverPosition={hoverPosition} 
            onFollowChange={onFollowChange}
        />
      </div>
    ) : null,
    document.body 
  );
};

export default UserHoverCardPortal;
