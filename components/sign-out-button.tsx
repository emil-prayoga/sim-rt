"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { UiIcon } from "@/components/ui-icon";

export function SignOutButton() {
  const demo = !isSupabaseConfigured();

  function signOut() {
    if (demo) {
      window.sessionStorage.removeItem("sirt-demo-session");
      window.location.reload();
    } else {
      void getSupabaseBrowserClient()?.auth.signOut();
    }
  }

  return (
    <button 
      onClick={signOut}
      title="Keluar"
      aria-label="Keluar dari portal"
      className="signout-button p-2 rounded-lg hover:bg-tertiary-container transition-colors"
    >
      <UiIcon name="logout" className="text-tertiary-fixed-dim hover:text-on-tertiary" />
    </button>
  );
}
