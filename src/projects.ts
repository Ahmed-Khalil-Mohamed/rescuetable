import { rescuetable } from "../apps/rescuetable/domain";
export const projects = [rescuetable];
export const findProject = (id: string) =>
  projects.find((project) => project.id === id);
