import { useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { PhaseSiteLog } from "../hooks/usePhaseDetails";
import SiteLogSidebarInfo from "./SiteLogSidebarInfo";
import { useAddComment } from "../hooks/useAddComment";
import { Image as ImageIcon, X, Send, Loader2 } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useProjectDetails } from "../../details/hooks/useProjectDetails";

interface SiteLogCardProps {
    log: PhaseSiteLog;
}

const SiteLogCard = ({ log }: SiteLogCardProps) => {
    const { orgSlug, projectSlug, phaseSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
        phaseSlug: string;
    }>();

    const { data: project, isLoading } = useProjectDetails(
        orgSlug,
        projectSlug,
    );

    const [commentText, setCommentText] = useState("");
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const { mutate: addComment, isPending } = useAddComment(
        orgSlug!,
        projectSlug!,
        phaseSlug!,
        log.id,
    );

    const handleSubmitComment = () => {
        if (!commentText.trim()) return;

        addComment(
            { text: commentText, imageId: selectedImageId },
            {
                onSuccess: () => {
                    setCommentText("");
                    setSelectedImageId(null);
                },
            },
        );
    };

    const selectedImageUrl = selectedImageId
        ? log.images.find((img) => img.id === selectedImageId)?.url
        : null;

    if (isLoading || !project) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
            </div>
        );
    }

    const isProjectActive = project.status === "ACTIVE";
    return (
        <article className="relative group pl-4">
            <div className="flex flex-col md:flex-row gap-16">
                <SiteLogSidebarInfo log={log} />

                <div className="md:w-3/4">
                    {log.description && (
                        <p className="text-stone-600 font-sans leading-relaxed mb-8 max-w-2xl">
                            {log.description}
                        </p>
                    )}

                    {log.images && log.images.length > 0 && (
                        <div
                            className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide"
                            style={{
                                maskImage:
                                    "linear-gradient(to right, black 85%, transparent 100%)",
                                WebkitMaskImage:
                                    "linear-gradient(to right, black 85%, transparent 100%)",
                            }}
                        >
                            {log.images.slice(0, 5).map((img, idx) => (
                                <div
                                    key={img.id}
                                    className="relative shrink-0 overflow-hidden rounded-xl aspect-4/3 w-70 bg-stone-100 cursor-zoom-in"
                                >
                                    <img
                                        src={img.url}
                                        alt={`Site log photo ${idx + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            ))}
                            <div className="w-8 shrink-0" />
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-stone-200">
                        <div className="space-y-6 mb-8">
                            {log.comments.length > 0 ? (
                                log.comments.map((comment) => {
                                    const pinnedImage = comment.imageId
                                        ? log.images.find(
                                              (img) =>
                                                  img.id === comment.imageId,
                                          )
                                        : null;

                                    return (
                                        <div
                                            key={comment.id}
                                            className="flex gap-4"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0 overflow-hidden">
                                                {comment.author.profile ? (
                                                    <img
                                                        src={
                                                            comment.author
                                                                .profile
                                                        }
                                                        alt={
                                                            comment.author.name
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-stone-300 text-stone-600 text-xs font-bold">
                                                        {comment.author.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold font-sans text-stone-900">
                                                        {comment.author.name}
                                                    </span>
                                                    <span className="text-[10px] font-sans text-stone-400">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                comment.createdAt,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                    </span>
                                                </div>

                                                {pinnedImage && (
                                                    <div className="mb-2 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded p-1 w-fit">
                                                        <img
                                                            src={
                                                                pinnedImage.url
                                                            }
                                                            alt="Reference"
                                                            className="w-6 h-6 object-cover rounded-sm"
                                                        />
                                                        <span className="text-[10px] font-sans text-stone-500 uppercase tracking-wider pr-2">
                                                            Referenced Image
                                                        </span>
                                                    </div>
                                                )}

                                                <p className="text-sm font-sans text-stone-600">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-stone-400 italic font-sans">
                                    {isProjectActive && "No comments yet. Be the first to share your thoughts."}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            {selectedImageUrl && (
                                <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 w-fit pl-1 pr-3 py-1 rounded-full relative animate-in fade-in zoom-in duration-200">
                                    <img
                                        src={selectedImageUrl}
                                        alt="Selected reference"
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-xs font-sans font-medium text-stone-600">
                                        Image Attached
                                    </span>
                                    <button
                                        onClick={() => setSelectedImageId(null)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 transition-transform"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            {isProjectActive && (
                                <div className="flex gap-3 items-end">
                                    {log.images.length > 0 && (
                                        <Popover
                                            open={isPopoverOpen}
                                            onOpenChange={setIsPopoverOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <button
                                                    className={`p-2.5 rounded-lg border transition-colors ${selectedImageId ? "bg-green-50 border-green-200 text-green-700" : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"}`}
                                                    title="Reference an image"
                                                >
                                                    <ImageIcon className="w-5 h-5" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-64 p-3 bg-white"
                                                align="start"
                                                side="top"
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">
                                                    Attach Reference Image
                                                </p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {log.images.map((img) => (
                                                        <button
                                                            key={img.id}
                                                            onClick={() => {
                                                                setSelectedImageId(
                                                                    img.id,
                                                                );
                                                                setIsPopoverOpen(
                                                                    false,
                                                                );
                                                            }}
                                                            className={`aspect-square rounded border-2 overflow-hidden hover:opacity-80 transition-all ${selectedImageId === img.id ? "border-green-700" : "border-transparent"}`}
                                                        >
                                                            <img
                                                                src={img.url}
                                                                alt="Thumbnail"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) =>
                                            setCommentText(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                handleSubmitComment();
                                        }}
                                        placeholder="Add a comment..."
                                        className="grow bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 transition-all h-[42px]"
                                    />

                                    <button
                                        onClick={handleSubmitComment}
                                        disabled={
                                            isPending || !commentText.trim()
                                        }
                                        className="bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium font-sans hover:bg-green-800 disabled:opacity-50 transition-all flex items-center justify-center min-w-[80px] h-[42px]"
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default SiteLogCard;
