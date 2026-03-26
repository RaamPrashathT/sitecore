import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientInviteButton = () => {
    const navigate = useNavigate();
    return (
        <div>
            <Button className="w-50" onClick={() => navigate("invite")}>
                <Mail />
                <p>Invite Clients</p>
            </Button>
        </div>
    );
};

export default ClientInviteButton;
