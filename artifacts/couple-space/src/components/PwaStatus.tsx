import { useRegisterSW } from "virtual:pwa-register/react";
import { useLang } from "@/lib/i18n";

export function PwaStatus() {
  const { t } = useLang();
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div role="status" className="fixed top-3 left-3 right-3 z-50 pixel-card p-4 text-sm max-w-md mx-auto">
      <p>{t("update_ready")}</p>
      <div className="flex gap-5 mt-2">
        <button className="underline" onClick={() => void updateServiceWorker(true)}>{t("update_reload")}</button>
        <button onClick={() => setNeedRefresh(false)}>{t("update_later")}</button>
      </div>
    </div>
  );
}
