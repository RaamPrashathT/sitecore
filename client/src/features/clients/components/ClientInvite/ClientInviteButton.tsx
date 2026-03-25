import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ClientInviteButton = () => {
    const navigate = useNavigate();
    return (
        <div>
            <Button onClick={() => navigate("invite")}>Invite Clients</Button>
        </div>
    );
};

export default ClientInviteButton;
