import type { PhaseListType } from "@/hooks/usePhaseList";

const PhaseList = ({phases}: {phases: PhaseListType[]}) => {
    if (!Array.isArray(phases)) {
        return <p>No phases found.</p>;
    }
    return (
        <div>
            {phases.map((phase) => (
                <div key={phase.id}>
                    <p>{phase.name}</p>
                    <p>{phase.description}</p>
                    <p>{phase.isPaid}</p>
                    <p>{phase.budget}</p>
                    <p>{phase.paymentDeadline.toString()}</p>
                    <p>{phase.status}</p>

                </div>
            ))}
        </div>
    );
};

export default PhaseList;