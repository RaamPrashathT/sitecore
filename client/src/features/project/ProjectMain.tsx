import { Outlet } from "react-router-dom";

const ProjectMain = () => {
    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectMain;