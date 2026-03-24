import { SquareArrowOutUpRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const IdlePage = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="flex flex-col items-center max-w-sm gap-6">
                <div className="p-4 rounded-full text-red-500">
                    <Clock size={48} strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-semibold tracking-tight">Pending Invitation</h1>
                    <p className="text-muted-foreground text-sm">
                        Your invitation has not been accepted yet. Please check back later or manage your organizations.
                    </p>
                </div>

                <Button 
                    variant="outline"
                    className="gap-2 w-full sm:w-auto px-8 border-green-500 bg-green-50 text-green-700"
                    onClick={() => navigate("/organizations")}
                >
                    <SquareArrowOutUpRight size={16} />
                    Go to Organizations
                </Button>
            </div>
        </div>
    );
};

export default IdlePage;