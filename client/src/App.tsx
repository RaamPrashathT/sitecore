import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import PrivateRoutes from "./routes/ProtectedRoutes";
import OrganizationListPage from "./pages/organization/orgList/OrgListPage";
import CreateOrgPage from "./pages/organization/orgList/CreateOrgPage";
import MainOrganizationPage from "./pages/organization/MainOrganizationPage";
import DashboardPage from "./pages/adminPages/DashboardPage";
import CataloguePage from "./pages/adminPages/catalogue/CataloguePage";
import EngineerPage from "./pages/adminPages/engineers/EngineersPage";
import ClientPage from "./pages/adminPages/clients/ClientPage";
import ProjectPage from "./pages/adminPages/ProjectsPage";
import SettingsPage from "./pages/adminPages/SettingsPage";
import CreateCataloguePage from "./pages/adminPages/catalogue/CreateCataloguePages";
import EditCataloguePage from "./pages/adminPages/catalogue/EditCataloguePage";
import OrgGuard from "./contexts/OrgContext";
import SearchOrgPage from "./pages/organization/orgList/SearchOrgPage";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<PrivateRoutes />}>
                        <Route
                            path="/organizations"
                            element={<OrganizationListPage />}
                        />
                        <Route
                            path="/organizations/create"
                            element={<CreateOrgPage />}
                        />
                        <Route path="/organizations/search"
                            element={<SearchOrgPage />}
                        />

                        <Route path="/:orgSlug" element={<OrgGuard />}>
                            <Route element={<MainOrganizationPage />}>
                                <Route index element={<DashboardPage />} />
                                <Route
                                    path="catalogue"
                                    element={<CataloguePage />}
                                />
                                <Route
                                    path="catalogue/create"
                                    element={<CreateCataloguePage />}
                                />
                                <Route
                                    path="catalogue/edit/:catalogueId/:quoteId"
                                    element={<EditCataloguePage />}
                                />
                                <Route
                                    path="engineers"
                                    element={<EngineerPage />}
                                />
                                <Route
                                    path="clients"
                                    element={<ClientPage />}
                                />
                                <Route
                                    path="projects"
                                    element={<ProjectPage />}
                                />
                                <Route
                                    path="settings"
                                    element={<SettingsPage />}
                                />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
