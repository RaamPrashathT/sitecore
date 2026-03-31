import { useNavigate, useParams } from "react-router-dom";
import { useProjectProgress } from "../hooks/useProjectProgress";
import {
    Loader2,
    Check,
    Clock,
    AlertCircle,
    ChevronRight,
    Settings,
    Plus,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useSession } from "@/features/auth/hooks/useSession";
import { UserAvatar } from "@/components/Avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const getStatusConfig = (status: string) => {
    switch (status) {
        case "COMPLETED":
            return {
                badge: (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold tracking-wide uppercase mt-px">
                        <Check className="w-3 h-3 mb-px" /> Completed
                    </span>
                ),
                nodeStyle: "bg-green-700 border-green-700",
                spineColor: "bg-green-200",
            };
        case "ACTIVE":
            return {
                badge: (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-semibold tracking-wide uppercase mt-px">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
                        Active
                    </span>
                ),
                nodeStyle: "bg-white border-green-700",
                spineColor: "bg-stone-200",
            };
        default:
            return {
                badge: (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200 text-[10px] font-semibold tracking-wide uppercase mt-px">
                        <Clock className="w-3 h-3 mb-px" />
                        {status.replace("_", " ")}
                    </span>
                ),
                nodeStyle: "bg-white border-stone-300",
                spineColor: "bg-stone-200",
            };
    }
};

const ProjectProgressMain = () => {
    const navigate = useNavigate();
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
    }>();
    const {
        data: phases,
        isLoading: isProgressLoading,
        isError: isProgressError,
    } = useProjectProgress(orgSlug, projectSlug);
    const {
        user,
        isLoading: isSessionLoading,
        isError: isSessionError,
    } = useSession();

    if (isProgressLoading || isSessionLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-5 w-5 animate-spin text-green-700" />
            </div>
        );
    }

    if (isProgressError || isSessionError || !phases || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-1">
                <AlertCircle className="w-6 h-6 text-stone-300 mb-1" />
                <p className="text-sm font-medium text-stone-700">
                    Failed to load progress timeline
                </p>
                <p className="text-xs text-stone-400">
                    Please try refreshing the page.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-10 pt-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="font-display text-3xl text-stone-900">
                            Project Progress
                        </h1>
                        <p className="font-sans text-stone-400 mt-px">
                            Your project timeline:
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(`create-phase`)}
                        className="font-display flex items-center gap-x-1 bg-green-700 rounded-lg px-3 py-1.5 text-white hover:bg-green-800 transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Phase</span>
                    </button>
                </div>
                <div className="relative">
                    {phases.map((phase, phaseIndex) => {
                        const { badge, nodeStyle, spineColor } =
                            getStatusConfig(phase.status);
                        const isLast = phaseIndex === phases.length - 1;

                        return (
                            <div key={phase.id} className="relative flex gap-6">
                                <div className="flex flex-col items-center w-5 shrink-0">
                                    <div
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shrink-0 mt-1 ${nodeStyle}`}
                                    >
                                        {phase.status === "COMPLETED" && (
                                            <Check
                                                className="w-2.5 h-2.5 text-white"
                                                strokeWidth={3}
                                            />
                                        )}
                                        {phase.status === "ACTIVE" && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
                                        )}
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={`w-[2px] flex-1 mt-1 ${spineColor}`}
                                        />
                                    )}
                                </div>

                                <div className={`flex-1 min-w-0 pb-4`}>
                                    <div className="flex justify-between">
                                        <div className="flex flex-wrap items-center gap-2  mt-0.5">
                                            <h2 className="text-xl font-display font-medium text-stone-900 tracking-tight">
                                                {phase.name}
                                            </h2>
                                            {badge}
                                        </div>
                                        <div className="flex flex-row items-center ">
                                            <Button
                                                variant={"ghost"}
                                                size={"sm"}
                                                onClick={() =>
                                                    navigate(
                                                        `create-log?phaseId=${phase.id}`,
                                                    )
                                                }
                                            >
                                                <Plus className="text-slate-500" />
                                                <p className="mt-[2px]">
                                                    Create Log
                                                </p>
                                            </Button>
                                            <Separator
                                                orientation="vertical"
                                                className=" data-[orientation=vertical]:h-4"
                                            />
                                            <Button
                                                variant={"ghost"}
                                                size={"sm"}
                                                onClick={() =>
                                                    navigate(
                                                        `update-phase?phaseId=${phase.id}`,
                                                    )
                                                }
                                            >
                                                <Settings className="text-slate-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-5 text-sm text-stone-400 font-mono">
                                        <span>
                                            Started{" "}
                                            {format(
                                                new Date(phase.startDate),
                                                "MMM d, yyyy",
                                            )}
                                        </span>
                                        <span className="text-stone-300">
                                            ·
                                        </span>
                                        <span>
                                            Budget{" "}
                                            <span className="text-stone-600 font-semibold font-mono">
                                                {formatCurrency(phase.budget)}
                                            </span>
                                        </span>
                                    </div>

                                    {phase.description && (
                                        <p className="text-sm text-stone-500 mb-5 leading-relaxed">
                                            {phase.description}
                                        </p>
                                    )}

                                    {phase.siteLogs.length > 0 && (
                                        <Accordion
                                            type="multiple"
                                            className="flex flex-col"
                                            defaultValue={phase.siteLogs.map(
                                                (log) => log.id,
                                            )}
                                        >
                                            {phase.siteLogs.map((log) => {
                                                return (
                                                    <AccordionItem
                                                        key={log.id}
                                                        value={log.id}
                                                        className="border-t border-stone-200"
                                                    >
                                                        <AccordionTrigger className="px-3 py-3 hover:no-underline  transition-colors [&>svg]:hidden group w-full text-left">
                                                            <div className="flex items-start justify-between w-full gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                                                        <span className="text-[16px] font-medium text-stone-900 leading-snug font-sans">
                                                                            {
                                                                                log.title
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 pl-6">
                                                                        <UserAvatar
                                                                            name={
                                                                                log
                                                                                    .author
                                                                                    .name
                                                                            }
                                                                            image={
                                                                                log
                                                                                    .author
                                                                                    .profile
                                                                            }
                                                                            className="w-6 h-6"
                                                                        />
                                                                        <span className="text-sm text-stone-400 font-sans">
                                                                            <span className="font-medium text-stone-700">
                                                                                {
                                                                                    log
                                                                                        .author
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-stone-400 font-mono">
                                                                    {format(
                                                                        new Date(
                                                                            log.workDate,
                                                                        ),
                                                                        "MMM d, yyyy",
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>

                                                        <AccordionContent className="px-3 pb-3">
                                                            <div className="">
                                                                {log.description && (
                                                                    <p className=" text-stone-700 mb-5 leading-relaxed font-sans">
                                                                        {
                                                                            log.description
                                                                        }
                                                                    </p>
                                                                )}

                                                                {log.images
                                                                    .length >
                                                                    0 && (
                                                                    <div className="relative mb-5">
                                                                        <div
                                                                            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                                                                            style={{
                                                                                maskImage:
                                                                                    "linear-gradient(to right, black 80%, transparent 100%)",
                                                                                WebkitMaskImage:
                                                                                    "linear-gradient(to right, black 80%, transparent 100%)",
                                                                            }}
                                                                        >
                                                                            {log.images.map(
                                                                                (
                                                                                    img,
                                                                                    idx,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            img.id
                                                                                        }
                                                                                        className="relative rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0"
                                                                                        style={{
                                                                                            width: "220px",
                                                                                            height: "148px",
                                                                                        }}
                                                                                    >
                                                                                        <img
                                                                                            src={
                                                                                                img.url
                                                                                            }
                                                                                            alt={`Site photo ${idx + 1}`}
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                            <div className="w-8 shrink-0" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectProgressMain;
