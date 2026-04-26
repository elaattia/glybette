import { Dribbble, Github, Globe, Instagram, Linkedin, Mail, Sparkles, Twitter, type LucideIcon } from "lucide-react";

export type PortfolioSocialIconOption = {
    value: string;
    label: string;
    Icon: LucideIcon;
};

export const socialIconOptions: PortfolioSocialIconOption[] = [
    { value: "globe", label: "Website", Icon: Sparkles },
    { value: "github", label: "GitHub", Icon: Github },
    { value: "linkedin", label: "LinkedIn", Icon: Linkedin },
    { value: "mail", label: "Email", Icon: Mail },
    { value: "twitter", label: "Twitter / X", Icon: Twitter },
    { value: "instagram", label: "Instagram", Icon: Instagram },
    { value: "dribbble", label: "Dribbble", Icon: Dribbble },
];

export const socialIcons: Record<string, LucideIcon> = {
    globe: Globe,
    github: Github,
    linkedin: Linkedin,
    mail: Mail,
    twitter: Twitter,
    instagram: Instagram,
    dribbble: Dribbble,
};

export function getSocialIcon(icon: string | undefined) {
    return socialIcons[icon ?? "globe"] ?? Globe;
}
