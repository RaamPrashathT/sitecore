export const getDeadlineStatus = (deadline: Date | string) => {
    const date = new Date(deadline);
    const now = new Date();
    
    const d1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffInDays = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));

    let message = "";
    let color = "text-gray-500";
    let isOverdue = false;

    if (diffInDays < 0) {
        const absDays = Math.abs(diffInDays);
        message = `${absDays} day${absDays === 1 ? "" : "s"} overdue`;
        color = "text-red-600";
        isOverdue = true;
    } else if (diffInDays === 0) {
        message = "Due today";
        color = "text-orange-500";
    } else {
        message = `${diffInDays} day${diffInDays === 1 ? "" : "s"} remaining`;
        color = "text-green-600";
    }

    return {
        formattedDate: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        message,
        color,
        isOverdue,
        diffInDays
    };
};