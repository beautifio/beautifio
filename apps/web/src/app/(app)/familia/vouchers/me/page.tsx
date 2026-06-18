import { redirect } from "next/navigation";

export default function OldMyVouchersPage() {
  redirect("/voucher/me");
}
