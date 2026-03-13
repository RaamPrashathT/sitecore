import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { PhaseListType } from "@/hooks/usePhaseList";
const PhaseList = ({ phases }: { phases: PhaseListType[] }) => {
    if (!Array.isArray(phases)) {
        return <p>No phases found.</p>;
    }
    return (
        <div className="p-6 ">
            <Accordion
                type="multiple"
                defaultValue={["Phase"]}
                className="rounded-lg border w-full"
            >
                {phases.map((phase) => (
                    <AccordionItem
                        value={phase.id}
                        key={phase.id}
                        className="border-b px-4 last:border-b-0 "
                    >
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex w-full justify-between items-center">
                                <p className="text-xl font-semibold ">
                                    {phase.name}
                                </p>
                                <Badge className="capitalize">
                                    {phase.status.toLowerCase()}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-y-4">
                            { phase.description && (
                                <div>   
                                    <p className="font-semibold text-gray-600">Description:</p>
                                    <p>{phase.description}</p>
                                </div>
                            )}
                            <div className="flex text-xl font-semibold gap-x-1">
                                <p className="">Budget:</p>
                                <p>{phase.budget}</p>
                            </div>
                            <div>
                                
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default PhaseList;
