// utils/projectStorage.ts
import {
  mkdir,
  readDir,
  readTextFile,
  writeTextFile,
  exists,
  remove,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: any;
}

const PROJECTS_DIR = "myapp-projects";
const BASE_DIR = BaseDirectory.Document;

// プロジェクト一覧を取得（isFile で直接判定）
export async function getProjectList(): Promise<Project[]> {
  try {
    // フォルダ作成（存在しなければ）
    await mkdir(PROJECTS_DIR, { baseDir: BASE_DIR, recursive: true });

    // フォルダ内容読み込み
    const entries = await readDir(PROJECTS_DIR, {
      baseDir: BASE_DIR,
    });

    const projects: Project[] = [];
    for (const entry of entries) {
      const fileName = entry.name;
      if (!fileName?.endsWith(".json")) {
        continue; // JSONファイルのみ対象
      }

      // isFile で直接ファイルか確認（stat不要！）
      if (!entry.isFile) {
        // ← ここで判定（isFile: boolean プロパティ）
        continue;
      }

      // 存在確認（念のため）
      if (
        !(await exists(`${PROJECTS_DIR}/${fileName}`, { baseDir: BASE_DIR }))
      ) {
        continue;
      }

      // JSON読み込み
      const content = await readTextFile(`${PROJECTS_DIR}/${fileName}`, {
        baseDir: BASE_DIR,
      });
      const project: Project = JSON.parse(content);

      // id抽出（ファイル名から。project.id と一致確認）
      const id = fileName.replace(".json", "");
      if (project.id !== id) {
        console.warn(`ID不一致: ファイル名=${id}, 内容=${project.id}`); // デバッグ用
      }

      projects.push(project); // ← project.id がリストに含まれる
    }

    // 更新日降順ソート
    return projects.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error("プロジェクト一覧取得エラー:", error);
    return [];
  }
}

// saveProject, loadProject, deleteProject は変更なし（id使用箇所は前回通り）
export async function saveProject(project: Project): Promise<void> {
  try {
    await mkdir(PROJECTS_DIR, { baseDir: BASE_DIR, recursive: true });
    project.updatedAt = new Date().toISOString();

    const fileName = `${project.id}.json`; // id をファイル名に使用
    await writeTextFile(
      `${PROJECTS_DIR}/${fileName}`,
      JSON.stringify(project, null, 2),
      { baseDir: BASE_DIR }
    );
    console.log(
      `プロジェクト "${project.name}" (ID: ${project.id}) を保存しました。`
    );
  } catch (error) {
    console.error("プロジェクト保存エラー:", error);
    throw error;
  }
}

export async function loadProject(id: string): Promise<Project | null> {
  try {
    const fileName = `${id}.json`; // id を使用
    if (!(await exists(`${PROJECTS_DIR}/${fileName}`, { baseDir: BASE_DIR }))) {
      return null;
    }

    const content = await readTextFile(`${PROJECTS_DIR}/${fileName}`, {
      baseDir: BASE_DIR,
    });
    return JSON.parse(content) as Project;
  } catch (error) {
    console.error("プロジェクト読み込みエラー:", error);
    return null;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const fileName = `${id}.json`; // id を使用
    if (await exists(`${PROJECTS_DIR}/${fileName}`, { baseDir: BASE_DIR })) {
      await remove(`${PROJECTS_DIR}/${fileName}`, { baseDir: BASE_DIR });
      console.log(`プロジェクト (ID: ${id}) を削除しました。`);
    }
  } catch (error) {
    console.error("プロジェクト削除エラー:", error);
    throw error;
  }
}
