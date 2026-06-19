import { API_BASE_URL } from "../../../config";
import type { ApplicationsResponse, EnterpriseApplicationsResponse } from "@glybette/contracts";

const JOBS_API = `${API_BASE_URL}/api/jobs`;

export const applicationsApi = {
    async submitApplication({ offreId, resume, coverLetter }: {
        offreId: string;
        resume: File;
        coverLetter: File;
    }) {
        const formData = new FormData();
        formData.append("offreId", offreId);
        formData.append("resume", resume);
        formData.append("coverLetter", coverLetter);

        const response = await fetch(`${JOBS_API}/applications`, {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.error || "Failed to submit application");
        }
        return response.json();
    },

    async getMyApplicationForOffre(offreId: string) {
        const response = await fetch(`${JOBS_API}/applications/offre/${offreId}/user`);
        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.error || "Failed to load application status");
        }
        return response.json();
    },

    async getMyApplications() {
        const response = await fetch(`${JOBS_API}/applications/user/my-applications`);
        if (!response.ok) throw new Error("Failed to fetch applications");
        return response.json();
    },

    async getApplicationsByOffre(offreId: string, status?: string) {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        const response = await fetch(`${JOBS_API}/applications/offre/${offreId}?${params}`);
        if (!response.ok) throw new Error("Failed to fetch applications");
        return response.json();
    },

    async getEnterpriseApplications() {
        const response = await fetch(`${JOBS_API}/applications/enterprise/all`);
        if (!response.ok) throw new Error("Failed to fetch enterprise applications");
        return response.json();
    },

    async updateApplicationStatus(
        applicationId: string,
        status: string,
        recruiterNotes?: string,
        rating?: number,
    ) {
        const response = await fetch(`${JOBS_API}/applications/${applicationId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, recruiterNotes, rating }),
        });
        if (!response.ok) throw new Error("Failed to update application");
        return response.json();
    },

    async getApplicationDetails(applicationId: string) {
        const response = await fetch(`${JOBS_API}/applications/${applicationId}`);
        if (!response.ok) throw new Error("Failed to fetch application");
        return response.json();
    },
};
