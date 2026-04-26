export function publicPortfolioUrl(slug: string, isPremium: boolean, isDisplayUrl?: boolean) {
    return isPremium
        ? `https://${slug}.glybette.com`
        : isDisplayUrl
          ? `https://glybette.com/user/${slug}`
          : `/user/${slug}`;
}

export function premiumPortfolioUrl(slug: string) {
    return `https://${slug || "name"}.glybette.com`;
}
