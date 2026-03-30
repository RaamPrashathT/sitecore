import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { PhaseDetailsSchema } from "../hooks/useGetPhaseDetails";
import DataTable from "../../phase/components/PhaseRequisitionTable";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { useMembership } from "@/hooks/useMembership";

export default function RequisitionList({ 
    requisitions, 
    phaseId 
}: { 
    readonly requisitions: PhaseDetailsSchema["requisitions"];
    readonly phaseId: string;
}) {
    const navigate = useNavigate();
    const {data: member, isLoading} = useMembership();
    const { projectSlug } = useParams(); 
    const handleGoToCreationPage = () => {
        navigate(`/${member?.slug}/${projectSlug}/phase/${phaseId}/requisition/new`);
    };

    if(isLoading) {
        return (
            <div> loading</div>
        )
    }    
    if (requisitions.length === 0) {
        return (
            <div className="">
                <h2 className="text-xl font-bold text-slate-900 mb-2">No Requisitions</h2>
                <p className="text-slate-500 text-sm mb-6">No materials ordered for this phase yet.</p>
                <Button onClick={handleGoToCreationPage} className="bg-green-700 hover:bg-green-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Requisition
                </Button>
            </div>
        );
    }

    return (
        <div className="mr-5">
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-slate-900">Requisitions</h2>
                    <span className="text-sm font-medium text-slate-500">{requisitions.length} total</span>
                </div>
                <Button size="sm" onClick={handleGoToCreationPage} className="bg-green-700 hover:bg-green-800">
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                </Button>
            </div>

            <Accordion type="multiple" className="w-full ">
                {requisitions.map((req) => (
                    <AccordionItem 
                        key={req.id} 
                        value={req.id} 
                        className="border border-b-slate-100 first:rounded-t-lg  px-4 bg-slate-50/50 transition-all last:rounded-b-lg"
                    >
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex flex-1 items-center justify-between pr-4">
                                <div className="text-left">
                                    <span className="block font-semibold text-slate-900">{req.itemsSummary}</span>
                                    <span className="block text-sm text-slate-500 mt-0.5">₹{req.budget }</span>
                                </div>
                                
                                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                                    req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    req.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-200 text-slate-700'
                                }`}>
                                    {req.status === 'PENDING_APPROVAL' ? 'Pending' : req.status === 'APPROVED' ? 'Approved' : 'Draft'}
                                </span>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="pt-2 pb-4">
                            {req.items && req.items.length > 0 ? (
                                <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
                                    <DataTable data={req.items} />
                                </div>
                            ) : (
                                <div className="text-center py-4 text-sm text-slate-500 bg-white rounded-md border border-slate-100">
                                    No item details found for this requisition.
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}