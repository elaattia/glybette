import { apiRequest } from "@/lib/api";
import type {
  CvDTO, CvSection, CvTemplate,
  AtsScoreResult, TailorResult, SuggestionsResult,
  CoverLetterResult, EnhanceResult, ExtractResult,
} from "../types/cv.types";

interface CvListResponse { cvs: CvDTO[] }
interface CvResponse     { cv: CvDTO }
interface PdfResponse    { pdfUrl: string }
interface ShareResponse  { shareToken: string; shareUrl: string }

export const cvApi = {


  list(): Promise<CvListResponse> {
    return apiRequest<CvListResponse>("/api/cvs");
  },

  getOne(id: string): Promise<CvResponse> {
    return apiRequest<CvResponse>(`/api/cvs/${id}`);
  },

  create(data: { title: string; template: CvTemplate; sections: CvSection[] }): Promise<CvResponse> {
    return apiRequest<CvResponse>("/api/cvs", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: Partial<{ title: string; template: CvTemplate; sections: CvSection[]; isPublic: boolean }>
  ): Promise<CvResponse> {
    return apiRequest<CvResponse>(`/api/cvs/${id}`, {
      method: "PATCH",
      body:   JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/cvs/${id}`, { method: "DELETE" });
  },

  duplicate(id: string): Promise<CvResponse> {
    return apiRequest<CvResponse>(`/api/cvs/${id}/duplicate`, { method: "POST" });
  },


  generatePdf(id: string): Promise<PdfResponse> {
    return apiRequest<PdfResponse>(`/api/cvs/${id}/pdf`, { method: "POST" });
  },


  sharePublic(id: string): Promise<ShareResponse> {
    return apiRequest<ShareResponse>(`/api/cvs/${id}/share`, { method: "POST" });
  },

  revokeShare(id: string): Promise<CvResponse> {
    return apiRequest<CvResponse>(`/api/cvs/${id}/share`, { method: "DELETE" });
  },

  getPublicCv(token: string): Promise<CvResponse> {
    return apiRequest<CvResponse>(`/api/share/${token}`);
  },


  scoreAts(id: string, jobDescription: string): Promise<AtsScoreResult> {
    return apiRequest<AtsScoreResult>(`/api/cvs/${id}/ats-score`, {
      method: "POST",
      body:   JSON.stringify({ jobDescription }),
    });
  },

  tailorCv(id: string, jobDescription: string): Promise<TailorResult> {
    return apiRequest<TailorResult>(`/api/cvs/${id}/tailor`, {
      method: "POST",
      body:   JSON.stringify({ jobDescription }),
    });
  },

  suggestImprovements(id: string, targetRole?: string): Promise<SuggestionsResult> {
    return apiRequest<SuggestionsResult>(`/api/cvs/${id}/suggest-improvements`, {
      method: "POST",
      body:   JSON.stringify({ targetRole }),
    });
  },

  coverLetter(id: string, jobDescription: string, tone?: string): Promise<CoverLetterResult> {
    return apiRequest<CoverLetterResult>(`/api/cvs/${id}/cover-letter`, {
      method: "POST",
      body:   JSON.stringify({ jobDescription, tone }),
    });
  },

  enhanceSection(id: string, text: string, sectionType: string): Promise<EnhanceResult> {
    return apiRequest<EnhanceResult>(`/api/cvs/${id}/enhance-section`, {
      method: "POST",
      body:   JSON.stringify({ text, sectionType }),
    });
  },

  extractFromText(text: string): Promise<ExtractResult> {
    return apiRequest<ExtractResult>("/api/cvs/extract", {
      method: "POST",
      body:   JSON.stringify({ text }),
    });
  },

  suggestSkills(role: string, existingSkills: string[]): Promise<{ skills: string[] }> {
    return apiRequest<{ skills: string[] }>("/api/cvs/suggest-skills", {
      method: "POST",
      body:   JSON.stringify({ role, existingSkills }),
    });
  },
};