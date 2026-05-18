import { OfficeShapeGeometryAdapter } from "../office/officeShapeGeometryAdapter";
import { LocalStorageCaptureSlot } from "../office/localStorageCaptureSlot";
import { CaptureService } from "../core/captureService";
import { ActionRunner, CommandHost } from "../core/commandHost";

/* global Office, location */

// The PowerPoint for Mac ribbon runtime is torn down between button clicks,
// so the capture slot is persisted in localStorage rather than memory.
let service: CaptureService | null = null;

function getService(): CaptureService {
  if (!service) {
    service = new CaptureService(
      new OfficeShapeGeometryAdapter(),
      new LocalStorageCaptureSlot(),
    );
  }
  return service;
}

let dialog: Office.Dialog | null = null;

function showDialog(message: string): void {
  const url = `${location.origin}/dialog.html?msg=${encodeURIComponent(message)}`;
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

/**
 * The real CommandHost: the only PowerPoint-coupled glue left. The API
 * gate, error->message mapping and the always-complete guarantee live in
 * the Office-free ActionRunner; this just speaks Office.js for one event.
 */
class OfficeCommandHost implements CommandHost {
  constructor(private readonly event: Office.AddinCommands.Event) {}

  isSupported(): boolean {
    return Office.context.requirements.isSetSupported("PowerPointApi", "1.4");
  }

  showMessage(message: string): void {
    showDialog(message);
  }

  completeEvent(): void {
    this.event.completed();
  }
}

function runAction(
  action: (s: CaptureService) => Promise<void>,
  event: Office.AddinCommands.Event,
): void {
  const runner = new ActionRunner(new OfficeCommandHost(event), getService());
  void runner.run(action);
}

function copy(event: Office.AddinCommands.Event): void {
  runAction((s) => s.capture(), event);
}

function pasteBoth(event: Office.AddinCommands.Event): void {
  runAction((s) => s.pasteBoth(), event);
}

function pasteDimensions(event: Office.AddinCommands.Event): void {
  runAction((s) => s.pasteDimensions(), event);
}

function pastePosition(event: Office.AddinCommands.Event): void {
  runAction((s) => s.pastePosition(), event);
}

Office.onReady(() => {
  Office.actions.associate("copy", copy);
  Office.actions.associate("pasteBoth", pasteBoth);
  Office.actions.associate("pasteDimensions", pasteDimensions);
  Office.actions.associate("pastePosition", pastePosition);
});
