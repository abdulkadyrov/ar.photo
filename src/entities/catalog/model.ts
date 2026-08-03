import type { Database, Tables } from "../../shared/api/database.types";

export type ProjectCategory = Database["public"]["Enums"]["project_category"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
export type MemberRole = Database["public"]["Enums"]["member_role"];

export type Project = Tables<"projects">;
export type Group = Tables<"groups">;
export type ProjectOption = Pick<Project, "id" | "name">;

export type Workspace = {
  accountId: string;
  accountName: string;
  accountStatus: Database["public"]["Enums"]["account_status"];
  memberRole: MemberRole;
  canWrite: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: string | null;
};

export type ProjectListItem = Project & {
  groupCount: number;
  arItemCount: number;
};

export type ProjectListFilter = ProjectStatus | "all" | "deleted";
export type ProjectListSort = "updated_desc" | "updated_asc" | "name_asc" | "name_desc";

export type ProjectListParams = {
  search: string;
  filter: ProjectListFilter;
  sort: ProjectListSort;
  page: number;
  pageSize: number;
};

export type PaginatedProjects = {
  items: ProjectListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProjectInput = {
  name: string;
  description: string;
  category: ProjectCategory;
};

export type GroupInput = {
  name: string;
  description: string;
};
