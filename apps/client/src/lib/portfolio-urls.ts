export function publicPortfolioUrl(slug: string, isPremium: boolean) {
    return isPremium ? `https://${slug}.glybette.com` : `https://glybette.com/user/${slug}`;
}

export function premiumPortfolioUrl(slug: string) {
    return `https://${slug || "name"}.glybette.com`;
}
