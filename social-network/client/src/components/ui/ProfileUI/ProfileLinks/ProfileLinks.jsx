import { useState } from 'react';
import { Link2 } from 'lucide-react'; // Hoặc thay bằng SVG nếu không dùng lucide-react

const ProfileLinks = ({ websites, isOpen, setIsOpen }) => {

  return (
    <>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#262626] text-[var(--text-primary-color)] rounded-2xl w-[360px] max-w-[90%] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center p-4 pb-2 border-b border-[var(--border-color)]">
                <h2 className="text-lg">Liên kết</h2>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 text-[var(--text-primary-color)] hover:text-white text-2xl cursor-pointer"
                >
                    &times;
                </button>
            </div>

            <ul className="max-h-[400px] overflow-y-auto">
              {websites.map((url, idx) => (
                <li key={idx} className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                  <Link2 className="w-5 h-5 text-[var(--text-primary-color)]" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-primary-color)] hover:underline break-words text-sm"
                  >
                    {shortenURL(url)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

const shortenURL = (url) => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, ''); // xóa www.
    return `${hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
};

export default ProfileLinks;
