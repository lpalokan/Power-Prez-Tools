import { CommandHost } from "../../src/core/commandHost";

/**
 * In-Node stand-in for the PowerPoint ribbon host. Records what the
 * ActionRunner did so step assertions can check the messaging behaviours
 * that were previously only verifiable by hand in PowerPoint.
 */
export class FakeCommandHost implements CommandHost {
  supported = true;
  readonly messages: string[] = [];
  completedCount = 0;

  isSupported(): boolean {
    return this.supported;
  }

  showMessage(message: string): void {
    this.messages.push(message);
  }

  completeEvent(): void {
    this.completedCount++;
  }
}
