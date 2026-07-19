import { apiRequest } from "@/lib/api";

export const applicationsApi = {
    submitApplication({ offreId, resume, coverLetter }: {
        offreId: string;
        resume: File;
        coverLetter: File;
    }) {
        const formData = new FormData();
        formData.append("offreId", offreId);
        formData.append("resume", resume);
        formData.append("coverLetter", coverLetter);

        return apiRequest(`/api/jobs/applications`, {
            method: "POST",
            body: formData,
        });
    },

    getMyApplicationForOffre(offreId: string) {
        return apiRequest(`/api/jobs/applications/offre/${offreId}/user`);
    },

    getMyApplications() {
        return apiRequest(`/api/jobs/applications/user/my-applications`);
    },

    getApplicationsByOffre(offreId: string, status?: string) {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        const q = params.toString() ? `?${params.toString()}` : "";
        return apiRequest(`/api/jobs/applications/offre/${offreId}${q}`);
    },

    getEnterpriseApplications() {
        return apiRequest(`/api/jobs/applications/enterprise/all`);
    },

    updateApplicationStatus(
        applicationId: string,
        status: string,
        recruiterNotes?: string,
        rating?: number,
    ) {
        return apiRequest(`/api/jobs/applications/${applicationId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status, recruiterNotes, rating }),
        });
    },

    getApplicationDetails(applicationId: string) {
        return apiRequest(`/api/jobs/applications/${applicationId}`);
    },
};
