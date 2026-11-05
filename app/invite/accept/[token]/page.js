import { inspectInvitationToken } from "@/server/family/familyService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AcceptInviteClient from "@/components/invitations/AcceptInviteClient";

export const metadata = {
  title: "Accept Family Invitation | Gurukul",
  description: "Accept an invitation to link your Gurukul account with your family circle.",
};

export default async function AcceptInvitePage({ params }) {
  const { token } = await params;
  let currentUser = null;

  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      currentUser = session.user;
    }
  } catch {}

  const inspection = await inspectInvitationToken(token);

  return (
    <AcceptInviteClient
      token={token}
      inspection={inspection}
      currentUser={currentUser}
    />
  );
}
