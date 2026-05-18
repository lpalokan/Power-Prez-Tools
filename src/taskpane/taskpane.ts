import { OfficeShapeGeometryAdapter } from "../office/officeShapeGeometryAdapter";
import { CaptureStore } from "../core/captureStore";
import { CaptureService } from "../core/captureService";

/* global Office, document, HTMLButtonElement */

const BUTTON_IDS = ["btnCapture", "btnPastePos", "btnPasteDim", "btnPasteBoth"];

function setStatus(message: string, kind: "ok" | "error"): void {
  const el = document.getElementById("status");
  if (el) {
    el.textContent = message;
    el.className = `status ${kind}`;
  }
}

function setButtonsEnabled(enabled: boolean): void {
  for (const id of BUTTON_IDS) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (btn) btn.disabled = !enabled;
  }
}

function bind(id: string, handler: () => Promise<void>): void {
  const btn = document.getElementById(id) as HTMLButtonElement | null;
  if (!btn) return;
  btn.addEventListener("click", async () => {
    setButtonsEnabled(false);
    try {
      await handler();
    } catch (e) {
      setStatus((e as Error).message, "error");
    } finally {
      setButtonsEnabled(true);
    }
  });
}

Office.onReady((info) => {
  if (info.host !== Office.HostType.PowerPoint) {
    setStatus("This add-in only runs in PowerPoint.", "error");
    return;
  }
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.4")) {
    setStatus(
      "This version of PowerPoint is too old (needs PowerPointApi 1.4). Please update PowerPoint.",
      "error",
    );
    return;
  }

  const service = new CaptureService(new OfficeShapeGeometryAdapter(), new CaptureStore());

  bind("btnCapture", async () => {
    await service.capture();
    setStatus("Captured position & dimensions.", "ok");
  });
  bind("btnPastePos", async () => {
    await service.pastePosition();
    setStatus("Position pasted.", "ok");
  });
  bind("btnPasteDim", async () => {
    await service.pasteDimensions();
    setStatus("Dimensions pasted.", "ok");
  });
  bind("btnPasteBoth", async () => {
    await service.pasteBoth();
    setStatus("Position & dimensions pasted.", "ok");
  });

  setButtonsEnabled(true);
  setStatus("Ready. Select an image and press Capture.", "ok");
});
