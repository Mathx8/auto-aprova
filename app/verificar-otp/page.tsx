import VerificarOtpClient from "./VerificarOtpClient";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ email?: string }>;
}) {
    const params = await searchParams;

    return <VerificarOtpClient email={params.email || ""} />;
}