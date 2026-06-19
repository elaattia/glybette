import { useUser } from "@/hooks/useUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";


export interface UserProfileData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    country?: string;
    university?: string;
    degree?: string;
    specialization?: string;
    graduationYear?: string;
    journey?: "Student" | "Graduate" | "Job Seeker";
    opportunities?: string[];
    domain?: string;
    skills?: string[];
    experience?: Array<{ position: string; company: string; description: string }>;
    education?: Array<{ degree: string; field: string; institution: string }>;
    summary?: string;
    lookingFor?: string[];
    languages?: Array<{ language: string; level: string }>;
}

export const profileQueryKeys = {
    profile: ["user", "profile"] as const,
};

async function fetchProfile(): Promise<UserProfileData> {
    try {
        const res = await apiRequest<{ profile: UserProfileData }>("/api/users/me/profile");
        return res.profile ?? {};
    } catch {
        const raw = localStorage.getItem("gb-onboarding-profile");
        return raw ? JSON.parse(raw) : {};
    }
}

async function saveProfile(profile: UserProfileData): Promise<void> {
    localStorage.setItem("gb-onboarding-profile", JSON.stringify(profile));
    try {
        await apiRequest("/api/users/me/profile", {
            method: "PUT",
            body: JSON.stringify({ profile }),
        });
    } catch {
    }
}

export function useUserProfile() {
    const auth = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: profileQueryKeys.profile,
        queryFn: fetchProfile,
        enabled: auth.isAuthenticated,
        staleTime: 30_000,
    });

    const saveMutation = useMutation({
        mutationFn: saveProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile });
        },
    });

    const buildProfileText = (profile: UserProfileData): string => {
        const parts: string[] = [];
        if (profile.summary) parts.push(`Résumé: ${profile.summary}`);
        if (profile.domain) parts.push(`Domaine: ${profile.domain}`);
        if (profile.skills?.length) parts.push(`Compétences: ${profile.skills.join(", ")}`);
        if (profile.experience?.length) {
            parts.push(
                `Expérience:\n${profile.experience
                    .map((e) => `  - ${e.position} @ ${e.company}: ${e.description}`)
                    .join("\n")}`,
            );
        }
        if (profile.education?.length) {
            parts.push(
                `Formation:\n${profile.education
                    .map((e) => `  - ${e.degree} ${e.field} @ ${e.institution}`)
                    .join("\n")}`,
            );
        }
        if (profile.languages?.length) {
            parts.push(`Langues: ${profile.languages.map((l) => `${l.language} (${l.level})`).join(", ")}`);
        }
        if (profile.opportunities?.length) {
            parts.push(`Recherche: ${profile.opportunities.join(", ")}`);
        }
        if (profile.journey) parts.push(`Statut: ${profile.journey}`);
        if (profile.university) parts.push(`Université: ${profile.university}, ${profile.degree ?? ""} en ${profile.specialization ?? ""}`);
        return parts.filter(Boolean).join("\n");
    };

    return {
        ...query,
        profile: query.data ?? {} as UserProfileData,
        saveProfile: saveMutation.mutateAsync,
        saveMutation,
        buildProfileText,
        isProfileComplete: Boolean(
            query.data?.domain || query.data?.skills?.length || query.data?.journey,
        ),
    };
}


export function useFullProfile() {
    const { profile, buildProfileText } = useUserProfile();
    const { user } = useUser();

    const cvProfile = (() => {
        try {
            const raw = localStorage.getItem("gb-cv-profile");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const merged: UserProfileData = {
        ...profile,
        firstName: profile.firstName ?? user?.displayName?.split(" ")[0],
        lastName: profile.lastName ?? user?.displayName?.split(" ").slice(1).join(" "),
        email: profile.email ?? user?.email,
        skills: cvProfile?.skills ?? profile.skills ?? [],
        experience: cvProfile?.experience ?? profile.experience ?? [],
        education: cvProfile?.education ?? profile.education ?? [],
        summary: cvProfile?.summary ?? profile.summary,
        languages: cvProfile?.languages ?? profile.languages ?? [],
        lookingFor: profile.opportunities,
    };

    return {
        profile: merged,
        profileText: buildProfileText(merged),
        hasProfile: Boolean(merged.skills?.length || merged.domain || merged.journey),
    };
}