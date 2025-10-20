import { useEffect, useState } from "preact/hooks";
import AdminQuestionnaireIsland from "../../../islands/AdminQuestionnaireIsland.tsx";

export default function QuestionnaireAdminPage() {
  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">All Questionnaire Responses</h1>
      <AdminQuestionnaireIsland />
    </div>
  );
}
