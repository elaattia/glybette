import { VerifyEmailPage } from "@/pages/login/VerifyEmailPage";

/** Preview route — renders {@link VerifyEmailPage} with auth namespace i18n. */
export function VerifyEmailMockPage() {
    return <VerifyEmailPage skipVerifiedRedirect />;
}
