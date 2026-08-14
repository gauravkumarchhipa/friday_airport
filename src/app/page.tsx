import { redirect } from "next/navigation";

import { CHECK_IN_OPS_DEFAULT_HREF } from "@/data/afterlogin/check-in-ops/tabs";

export default function HomePage() {
  redirect(CHECK_IN_OPS_DEFAULT_HREF);
}
