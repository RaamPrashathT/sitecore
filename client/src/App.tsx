import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import OrganizationListPage from "./pages/org/OrganizationListPage";
import PrivateRoutes from "./routes/ProtectedRoutes";
import OrganizationPage from "./pages/org/OrganizationPage";

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
                            path="/org/:organizationNameSlug"
                            element={<OrganizationPage />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
