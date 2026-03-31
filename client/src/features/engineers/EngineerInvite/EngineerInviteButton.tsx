import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EngineerInviteButton = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Button
                className="h-10 w-50 bg-green-700 font-sans text-sm text-white hover:bg-green-800"
                onClick={() => navigate("invite")}
            >
                <Mail className="size-4" />
                <p>Invite Engineers</p>
            </Button>
        </div>
    );
};

export default EngineerInviteButton;
