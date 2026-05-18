import { OfficeShapeGeometryAdapter } from "../office/officeShapeGeometryAdapter";
import { LocalStorageCaptureSlotStorage } from "../office/localStorageCaptureSlotStorage";
import { CaptureStore } from "../core/captureStore";
import { CaptureService } from "../core/captureService";

/* global Office */

// The PowerPoint for Mac ribbon runtime is torn down between button clicks,
// so the capture slot is persisted in localStorage rather than memory.
let service: CaptureService | null = null;

function getService(): CaptureService {
  if (!service) {
    const store = new CaptureStore(new LocalStorageCaptureSlotStorage());
    service = new CaptureService(new OfficeShapeGeometryAdapter(), store);
  }
  return service;
}

let dialog: Office.Dialog | null = null;

function showMessage(message: string): void {
  const url = `https://localhost:3000/dialog.html?msg=${encodeURIComponent(message)}`;
  Office.context.ui.displayDialogAsync(
    url,
    { height: 24, width: 32, displayInIframe: true },
    (res) => {
      if (res.status === Office.AsyncResultStatus.Succeeded) {
        dialog = res.value;
        dialog.addEventHandler(Office.EventType.DialogMessageReceived, () => {
          dialog?.close();
          dialog = null;
        });
      }
    },
  );
}

function ensureSupported(): boolean {
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.4")) {
    showMessage(
      "This version of PowerPoint is too old (needs PowerPointApi 1.4). Please update PowerPoint.",
    );
    return false;
  }
  return true;
}

async function runAction(
  action: (s: CaptureService) => Promise<void>,
  event: Office.AddinCommands.Event,
): Promise<void> {
  try {
    if (ensureSupported()) {
      await action(getService());
    }
  } catch (e) {
    showMessage((e as Error).message);
  } finally {
    event.completed();
  }
}

function copy(event: Office.AddinCommands.Event): void {
  void runAction((s) => s.capture(), event);
}

function pasteBoth(event: Office.AddinCommands.Event): void {
  void runAction((s) => s.pasteBoth(), event);
}

function pasteDimensions(event: Office.AddinCommands.Event): void {
  void runAction((s) => s.pasteDimensions(), event);
}

function pastePosition(event: Office.AddinCommands.Event): void {
  void runAction((s) => s.pastePosition(), event);
}

Office.onReady(() => {
  Office.actions.associate("copy", copy);
  Office.actions.associate("pasteBoth", pasteBoth);
  Office.actions.associate("pasteDimensions", pasteDimensions);
  Office.actions.associate("pastePosition", pastePosition);
});
