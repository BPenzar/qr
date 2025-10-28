"use server";

import "server-only";
import { subDays, eachDayOfInterval, formatISO } from "date-fns";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type { Tables } from "@/lib/database.types";

export type ResponseSummary = {
  totalResponses: number;
  responsesThisWeek: number;
  responsesLastWeek: number;
  averageRating: number | null;
  qrShare: number;
  widgetShare: number;
};

export const getResponseSummary = async (accountId: string): Promise<ResponseSummary> => {
  const supabase = await getServerSupabaseClient();
  const since = subDays(new Date(), 21).toISOString();

  const { data, error } = await supabase
    .from("responses")
    .select("channel,rating,submitted_at")
    .eq("account_id", accountId)
    .gte("submitted_at", since);

  if (error) {
    console.error("Failed to fetch responses summary", error);
    throw error;
  }

  const now = new Date();
  const startOfThisWeek = subDays(now, now.getDay());
  const startOfLastWeek = subDays(startOfThisWeek, 7);
  const endOfLastWeek = subDays(startOfThisWeek, 1);

  let totalResponses = 0;
  let responsesThisWeek = 0;
  let responsesLastWeek = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let qrCount = 0;
  let widgetCount = 0;

  data?.forEach((response) => {
    totalResponses += 1;
    const submittedAt = new Date(response.submitted_at);
    if (submittedAt >= startOfThisWeek) {
      responsesThisWeek += 1;
    } else if (submittedAt >= startOfLastWeek && submittedAt <= endOfLastWeek) {
      responsesLastWeek += 1;
    }
    if (typeof response.rating === "number") {
      ratingSum += response.rating;
      ratingCount += 1;
    }
    if (response.channel === "qr") qrCount += 1;
    if (response.channel === "widget") widgetCount += 1;
  });

  const averageRating = ratingCount > 0 ? ratingSum / ratingCount : null;
  const qrShare =
    totalResponses > 0 ? Math.round((qrCount / totalResponses) * 100) : 0;
  const widgetShare =
    totalResponses > 0 ? Math.round((widgetCount / totalResponses) * 100) : 0;

  return {
    totalResponses,
    responsesThisWeek,
    responsesLastWeek,
    averageRating,
    qrShare,
    widgetShare,
  };
};

export type ResponsesTrendPoint = {
  date: string;
  responses: number;
  averageRating: number | null;
};

export const getResponsesTrend = async (
  accountId: string,
  days = 14,
): Promise<ResponsesTrendPoint[]> => {
  const supabase = await getServerSupabaseClient();
  const since = subDays(new Date(), days).toISOString();
  const { data, error } = await supabase
    .from("responses")
    .select("submitted_at,rating")
    .eq("account_id", accountId)
    .gte("submitted_at", since);

  if (error) {
    console.error("Failed to fetch response trend", error);
    throw error;
  }

  const start = subDays(new Date(), days - 1);
  const daysInterval = eachDayOfInterval({
    start,
    end: new Date(),
  });

  return daysInterval.map((day) => {
    const dayString = formatISO(day, { representation: "date" });
    const responsesForDay = data?.filter(
      (resp) => formatISO(new Date(resp.submitted_at), { representation: "date" }) === dayString,
    );
    const responses = responsesForDay?.length ?? 0;
    const ratingValues =
      responsesForDay
        ?.map((resp) => resp.rating)
        .filter((rating): rating is number => typeof rating === "number") ?? [];
    const averageRating =
      ratingValues.length > 0
        ? ratingValues.reduce((sum, rating) => sum + rating, 0) /
          ratingValues.length
        : null;

    return {
      date: dayString,
      responses,
      averageRating,
    };
  });
};

export const getRecentResponses = async (
  accountId: string,
  limit = 10,
): Promise<Tables<"responses">[]> => {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("account_id", accountId)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent responses", error);
    throw error;
  }

  return data ?? [];
};
