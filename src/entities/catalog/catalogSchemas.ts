import { z } from "zod";

export const projectCategories = [
  "graduation",
  "wedding",
  "family",
  "birthday",
  "travel",
  "advertising",
  "museum",
  "other",
] as const;

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Укажите название проекта").max(160, "Не более 160 символов"),
  description: z.string().trim().max(2000, "Не более 2000 символов"),
  category: z.enum(projectCategories),
});

export const groupFormSchema = z.object({
  name: z.string().trim().min(1, "Укажите название группы").max(160, "Не более 160 символов"),
  description: z.string().trim().max(2000, "Не более 2000 символов"),
});

export const projectListParamsSchema = z.object({
  search: z.string().trim().max(160).default(""),
  filter: z.enum(["all", "draft", "active", "archived", "deleted"]).default("all"),
  sort: z.enum(["updated_desc", "updated_asc", "name_asc", "name_desc"]).default("updated_desc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
});
