import { format } from "date-fns";
import type { PhaseSiteLog } from "../hooks/usePhaseDetails";

interface SiteLogSidebarInfoProps {
    log: PhaseSiteLog;
}

const SiteLogSidebarInfo = ({ log }: SiteLogSidebarInfoProps) => {
    return (
        <div className="md:w-1/4">
            <div className="">
                <time className="text-xs font-mono text-stone-500 tracking-tighter uppercase">
                    {format(new Date(log.workDate), "MMM dd, yyyy • hh:mm a")}
                </time>
                
                <h3 className="font-display text-2xl mt-2 text-stone-900 leading-tight">
                    {log.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-4">
                    <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden shrink-0">
                        {log.author.profile ? (
                            <img
                                src={log.author.profile}
                                alt={log.author.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-300 text-stone-600 text-[10px] font-bold">
                                {log.author.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-sans font-medium text-stone-700">
                        {log.author.name}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SiteLogSidebarInfo;