import { useState } from "react";
import {
  Link as LinkIcon,
  Search 
} from "lucide-react";
import CopyLinkModal from "~/components/ui/PostUI/Post/CopyLinkModal";


const friends = [
  { name: "abc", avatar: "https://via.placeholder.com/40" },
  { name: "Rikka Takanashi", avatar: "https://via.placeholder.com/40?text=RT" },
];

export default function ShareModal({ isOpen, onClose, postId  }) {
    const [search, setSearch] = useState("");
    const [isCopyModalVisible, setCopyModalVisible] = useState(false);

    const filteredFriends = friends.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCopyLink = () => {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      setCopyModalVisible(true);

      // Ẩn modal sau 1.5 giây
      setTimeout(() => {
        setCopyModalVisible(false);
      }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[var(--secondary-color)] text-white w-full max-w-md rounded-lg p-4 relative">
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-[var(--border-color)]">
                    <button
                    onClick={onClose}
                    className="text-[var(--text-primary-color)] text-3xl p-2 absolute right-4 cursor-pointer hover:opcity-80"
                    >
                    ×
                    </button>
            
                    <h2 className="mx-auto text-lg text-[var(--text-primary-color)] font-semibold">Chia sẻ</h2>
                </div>

                <div className="flex items-center bg-black rounded px-3 py-2 mb-3 w-full">
                    <Search className="text-neutral-400 w-5 h-5 mr-2" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-neutral-400 focus:outline-none"
                    />
                    {search && (
                        <button
                        onClick={() => setSearch("")}
                        className="text-blue-500 text-sm ml-2"
                        >
                        Hủy
                        </button>
                    )}
                    </div>

                <div className="max-h-40 overflow-y-auto mb-4 space-y-2">
                {filteredFriends.map((friend, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-1 hover:bg-neutral-800 rounded">
                    <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <span>{friend.name}</span>
                    </div>
                ))}
                </div>

                <div className="border-t-2 border-[var(--border-color)] pt-4">
                <ShareButton icon={<LinkIcon size={20} />} label="Sao chép liên kết" onClick={handleCopyLink}/>
                </div>
            </div>
            {
                      isCopyModalVisible &&
                      <CopyLinkModal isVisible={isCopyModalVisible} onClose={() => setCopyModalVisible(false)} />
                    }
        </div>
    );
}

function ShareButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
     className="flex flex-col items-center text-xs text-[var(--text-primary-color)] cursor-pointer hover:text-[var(--text-secondary-color)]">
      <div className="bg-neutral-800 p-2 rounded-full mb-1">{icon}</div>
      {label}
    </button>
  );
}
