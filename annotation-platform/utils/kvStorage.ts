export const db = await Deno.openKv();

class KVStorage {
  async addAnnotation(annotation: AnnotationData): Promise<string> {
    const r = await db.set(
      [annotation.project, annotation.user, annotation.file],
      annotation.annotation,
    );
    if (r.ok) {
      return "Success";
    } else {
      return "Failed";
    }
  }

  async getRatingsPerAnnotator(
    token: string,
    project: string,
  ): Promise<object> {
    if (token == "YOUR_SECRET_KEY") {
      const entries = db.list({ prefix: [project] });
      const data = [];
      for await (const entry of entries) {
        data.push(entry);
      }
      return data;
    }
    return {};
  }

  async performAnalysisOnProject(
    token: string,
    project: string,
  ): Promise<object> {
    if (token == "YOUR_SECRET_KEY") {
      const entries = db.list({ prefix: [project] });
      const data = [];
      for await (const entry of entries) {
        data.push(entry);
      }
      return data;
    }
    return {};
  }

  async getAnnotationForProjectUserFile(
    user: string,
    project: string,
    file: string,
  ): Promise<object> {
    const r = await db.get([project, user, file]);
    return r;
  }

  async getLastAnnotationForProjectUser(
    user: string,
    project: string,
  ): Promise<object> {
    const entries = db.list({ prefix: [project, user] });
    let lastEntry = null;

    for await (const entry of entries) {
      if (!lastEntry) {
        lastEntry = entry;
      } else {
        if (entry.versionstamp > lastEntry.versionstamp) {
          lastEntry = entry;
        }
      }
    }

    if (lastEntry) {
      return { "lastImage": lastEntry.key[2] };
    } else {
      return { "lastImage": "" };
    }
  }

  async getAllAnnotations(p: string): Promise<object> {
    const entries = db.list({ prefix: [p] });
    const data = [];
    for await (const entry of entries) {
      data.push(entry);
    }
    return data;
  }

  async getAllCompareAnnotations(compareProject: string): Promise<object> {
    const entries = db.list({ prefix: ["compare|" + compareProject] });
    const data = [];
    for await (const entry of entries) {
      data.push(entry);
    }
    return data;
  }

  async deleteAllAnnotations(p: string): Promise<string> {
    const entries = db.list({ prefix: [p] });
    for await (const entry of entries) {
      await db.delete(entry.key);
    }
    return "Success";
  }

  async addQuestionnaireResponse(email: string, responses: object): Promise<string> {
    const r = await db.set(["questionnaire", email], responses);
    return r.ok ? "Success" : "Failed";
  }

  async getQuestionnaireResponse(email: string): Promise<object | null> {
    const r = await db.get(["questionnaire", email]);
    return r.value ?? null;
  }
}

export const kvStorage = new KVStorage();
