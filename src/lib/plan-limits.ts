export type PlanLimits = {
  projects?: number;
  forms_per_project?: number;
  responses_per_month?: number;
  members?: number;
  qr_codes_per_form?: number;
};

type MaybeAccount = {
  plan?: {
    limits?: unknown;
  } | null;
} | null;

export const parsePlanLimits = (account: MaybeAccount) => {
  const rawLimits = (account?.plan?.limits ?? {}) as Record<string, unknown>;
  const limits: PlanLimits = {};
  if (typeof rawLimits.projects === "number") {
    limits.projects = rawLimits.projects;
  }
  if (typeof rawLimits.forms_per_project === "number") {
    limits.forms_per_project = rawLimits.forms_per_project;
  }
  if (typeof rawLimits.responses_per_month === "number") {
    limits.responses_per_month = rawLimits.responses_per_month;
  }
  if (typeof rawLimits.members === "number") {
    limits.members = rawLimits.members;
  }
  if (typeof rawLimits.qr_codes_per_form === "number") {
    limits.qr_codes_per_form = rawLimits.qr_codes_per_form;
  }
  return limits;
};

export const assertProjectsLimit = (
  limits: PlanLimits,
  currentProjects: number,
) => {
  if (limits.projects !== undefined && currentProjects >= limits.projects) {
    throw new Error(
      `Plan limit reached: only ${limits.projects} project${limits.projects === 1 ? "" : "s"} allowed.`,
    );
  }
};

export const assertFormsLimit = (
  limits: PlanLimits,
  currentForms: number,
) => {
  if (
    limits.forms_per_project !== undefined &&
    currentForms >= limits.forms_per_project
  ) {
    throw new Error(
      `Plan limit reached: ${limits.forms_per_project} forms per project on this plan.`,
    );
  }
};

export const assertResponsesLimit = (
  limits: PlanLimits,
  currentResponsesThisMonth: number,
) => {
  if (
    limits.responses_per_month !== undefined &&
    currentResponsesThisMonth >= limits.responses_per_month
  ) {
    throw new Error(
      `Response quota reached: ${limits.responses_per_month} per month on current plan.`,
    );
  }
};

export const assertQrLimit = (
  limits: PlanLimits,
  currentQrCodes: number,
) => {
  if (
    limits.qr_codes_per_form !== undefined &&
    currentQrCodes >= limits.qr_codes_per_form
  ) {
    throw new Error(
      `QR code limit reached: ${limits.qr_codes_per_form} per form on this plan.`,
    );
  }
};
