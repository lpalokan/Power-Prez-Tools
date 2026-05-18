import { CaptureService } from "./captureService";

/**
 * Everything a ribbon command needs from its host environment, with zero
 * Office.js. OfficeCommandHost (src/commands/commands.ts) is the real
 * adapter; FakeCommandHost (the Cucumber suite) is the second. This is a
 * real seam, so the messaging behaviours below are expressible as .feature
 * scenarios instead of only being verifiable by hand in PowerPoint.
 */
export interface CommandHost {
  /** Whether the host supports the required PowerPoint API (1.4). */
  isSupported(): boolean;
  /** Surface a short message to the user (a small Office dialog in production). */
  showMessage(message: string): void;
  /** Tell the host the command finished. Office requires this to always fire,
   * or the ribbon button stays spinning. */
  completeEvent(): void;
}

/** Shown when the host's PowerPoint predates PowerPointApi 1.4. */
export const TOO_OLD_MESSAGE =
  "This version of PowerPoint is too old (needs PowerPointApi 1.4). Please update PowerPoint.";

/**
 * The orchestration glue, lifted out of commands.ts so it is testable in
 * Node: the API-version gate, error -> message mapping, and the guarantee
 * that completeEvent() fires on every path (success, thrown error, or an
 * unsupported host). commands.ts is now a thin Office adapter over this.
 */
export class ActionRunner {
  constructor(
    private readonly host: CommandHost,
    private readonly service: CaptureService,
  ) {}

  async run(action: (s: CaptureService) => Promise<void>): Promise<void> {
    try {
      if (!this.host.isSupported()) {
        this.host.showMessage(TOO_OLD_MESSAGE);
        return;
      }
      await action(this.service);
    } catch (e) {
      this.host.showMessage((e as Error).message);
    } finally {
      this.host.completeEvent();
    }
  }
}
