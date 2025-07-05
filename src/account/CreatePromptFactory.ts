import { interactionPolicy } from "@solid/community-server/templates/types/oidc-provider";
import { getLoggerFor, PromptFactory } from "@solid/community-server";

/**
 * Make a "create" prompt
 */
export class CreatePromptFactory extends PromptFactory {
  protected readonly logger = getLoggerFor(this);

  public async handle(policy: interactionPolicy.DefaultPolicy): Promise<void> {
    const oidcProvider = await import("oidc-provider");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.addCreatePrompt(policy, oidcProvider.interactionPolicy.Prompt);
  }

  private addCreatePrompt(
    policy: interactionPolicy.DefaultPolicy,
    prompt: typeof interactionPolicy.Prompt,
  ): void {
    const createPrompt = new prompt({ name: "create", requestable: true });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    policy.add(createPrompt, 0);
  }
}
