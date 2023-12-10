import { useState, useMemo } from "react";

import {
  mdiAlert,
  mdiCheckCircleOutline,
  mdiAlarmLightOutline,
  mdiLightbulbOutline,
} from "@mdi/js";
import Icon from "@mdi/react";

const toastIconMap = {
  error: mdiAlert,
  success: mdiCheckCircleOutline,
  warning: mdiAlarmLightOutline,
  info: mdiLightbulbOutline,
};

export function Toast({
  text,
  className,
  type,
}: {
  text: string;
  className?: string;
  type: "error" | "success" | "warning" | "info";
}) {
  const [typeCss, setTypeCss] = useState("");

  const [toast, setToast] = useState<JSX.Element | null>(null);

  useMemo(() => {
    setTypeCss(`alert alert-${type} flex`);
  }, [type]);

  useMemo(() => {
    setToast(
      <div className={className}>
        <div role="alert" className={typeCss}>
          <Icon path={toastIconMap[type]} size={1} />
          <span>{text}</span>
        </div>
      </div>
    );
  }, [className, text, type, typeCss]);

  return <>{toast}</>;
}
