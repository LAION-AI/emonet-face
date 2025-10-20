import { Handlers, PageProps } from "$fresh/server.ts";
import QuestionnaireIsland from "../../islands/QuestionnaireIsland.tsx";

interface QuestionnairePageData {
  user: string | null;
}

export const handler: Handlers<QuestionnairePageData> = {
  async GET(_req, ctx) {
    const user = (ctx.state.session as { user: { email: string } })?.user?.email ?? null;
    return ctx.render({ user });
  },
};

export default function QuestionnairePage(props: PageProps<QuestionnairePageData>) {
  if (!props.data.user) {
    return (
      <div>
        Please <a href="/login" class="font-bold">log in</a> to fill out the questionnaire.
      </div>
    );
  }
  return (
    <div class="max-w-2xl mx-auto py-8">
      <QuestionnaireIsland userEmail={props.data.user} />
    </div>
  );
}
