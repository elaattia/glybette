export function makeDefaultSections() {
    return [
        {
            type: "personal-info",
            order: 0,
            data: {
                firstName: "",
                lastName: "",
                roleTitle: "",
                email: "",
                phone: "",
                location: "",
                linkedin: "",
                github: "",
                website: "",
            },
        },
        { type: "summary", order: 1, data: { text: "" } },
        { type: "experience", order: 2, data: [] },
        { type: "education", order: 3, data: [] },
        { type: "skills", order: 4, data: [] },
    ];
}
