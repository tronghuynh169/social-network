export const formatPostTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays <= 7) return `${diffDays} ngày trước`;

    if (now.getFullYear() === created.getFullYear()) {
        // Trả về: "12 Th3"
        return `${created.getDate()} Th${created.getMonth() + 1}`;
    }

    // Trả về: "12 Th3, 2024"
    return `${created.getDate()} Th${
        created.getMonth() + 1
    }, ${created.getFullYear()}`;
};
