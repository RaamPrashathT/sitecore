import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";

import PrivateRoutes from "./features/auth/components/ProtectedRoutes";
import OrgGuard from "./contexts/OrgContext";

import OrganizationListPage from "./pages/organization/orgList/OrgListPage";
import CreateOrgPage from "./pages/organization/orgList/CreateOrgPage";
import SearchOrgPage from "./pages/organization/orgList/SearchOrgPage";
import MainOrganizationPage from "./pages/organization/MainOrganizationPage";

import DashboardPage from "./pages/adminPages/dashboard/DashboardPage";
import CataloguePage from "./pages/adminPages/catalogue/CataloguePage";
import CreateCataloguePage from "./pages/adminPages/catalogue/CreateCataloguePages";
import EditCataloguePage from "./pages/adminPages/catalogue/EditCataloguePage";

import EngineerPage from "./pages/adminPages/engineers/EngineersPage";
import ClientPage from "./pages/adminPages/clients/ClientPage";

import ProjectPage from "./pages/adminPages/project/ProjectPage";
import CreateProjectPage from "./pages/adminPages/project/CreateProjectPage";
import ProjectListPage from "./pages/adminPages/project/ProjectListPage";
import PhaseCreationPage from "./pages/adminPages/project/PhaseCreationPage";
import RequisitionCreationPage from "./pages/adminPages/project/RequisitionCreationPage";

import PendingRequisitionPage from "./pages/adminPages/pending/PendingRequisitionPage";
import PhasePaymentApprovalPage from "./pages/adminPages/pending/PhasePaymentApprovalPage";
import PendingInvitationsPage from "./pages/adminPages/pending/PendingInvitationsPage";

import SettingsPage from "./pages/adminPages/SettingsPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoutes />}>
                        <Route path="/organizations" element={<OrganizationListPage />} />
                        <Route path="/organizations/create" element={<CreateOrgPage />} />
                        <Route path="/organizations/search" element={<SearchOrgPage />} />

                        {/* Organization Scoped Routes */}
                        <Route path="/:orgSlug" element={<OrgGuard />}>
                            <Route element={<MainOrganizationPage />}>
                                <Route index element={<DashboardPage />} />

                                {/* Catalogue */}
                                <Route path="catalogue" element={<CataloguePage />} />
                                <Route path="catalogue/create" element={<CreateCataloguePage />} />
                                <Route
                                    path="catalogue/edit/:catalogueId/:quoteId"
                                    element={<EditCataloguePage />}
                                />

                                {/* Users */}
                                <Route path="engineers" element={<EngineerPage />} />
                                <Route path="clients" element={<ClientPage />} />

                                {/* Projects */}
                                <Route path="projects" element={<ProjectListPage />} />
                                <Route path="projects/create" element={<CreateProjectPage />} />

                                <Route
                                    path=":projectSlug/create-phase"
                                    element={<PhaseCreationPage />}
                                />
                                <Route
                                    path=":projectSlug/requisition/:requisitionIdSlug"
                                    element={<RequisitionCreationPage />}
                                />
                                <Route path=":projectSlug" element={<ProjectPage />} />

                                {/* Pending */}
                                <Route
                                    path="pending-requisitions"
                                    element={<PendingRequisitionPage />}
                                />
                                <Route
                                    path="pending-payments"
                                    element={<PhasePaymentApprovalPage />}
                                />
                                <Route
                                    path="pending-invitations"
                                    element={<PendingInvitationsPage />}
                                />

                                {/* Settings */}
                                <Route path="settings" element={<SettingsPage />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;