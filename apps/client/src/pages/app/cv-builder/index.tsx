import { useNavigate } from "react-router-dom";
import { CvListView } from "@/features/cv-builder";
import type { CvDTO } from "@/features/cv-builder";

export default function CvListPage() {
    const navigate = useNavigate();

    return (
        <CvListView
            onNewCv={() => navigate("/app/cv/create")}
            onEditCv={(cv: CvDTO) => navigate(`/app/cv/${cv._id}`)}
        />
    );
}