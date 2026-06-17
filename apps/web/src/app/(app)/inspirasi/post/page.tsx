import { redirect } from "next/navigation";

export default function OldPostRedirect() {
  redirect("/curhat/post");
}
