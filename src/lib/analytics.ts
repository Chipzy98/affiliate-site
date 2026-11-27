import "server-only";
import { sql, safe } from "./db";

const TZ = process.env.ANALYTICS_TZ || "Asia/Colombo";

export type Row = { label: string; value: number; extra?: number };

export type Dashboard = {
  days: number;
  views: number;
  visitors: number;
  clicks: number;
  liveNow: number;
  todayVisitors: number;
  daily: { day: string; views: number; visitors: number; clicks: number }[];
  countries: { country: string | null; views: number; visitors: number; clicks: number }[];
  pages: Row[];
  referrers: Row[];
  devices: Row[];
  browsers: Row[];
  os: Row[];
  topProducts: { id: number | null; title: string | null; slug: string | null; clicks: number }[];
  recent: RecentVisit[];
};

export type RecentVisit = {
  id: number;
  path: string;
  referrer: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  created_at: Date;
};

const EMPTY: Dashboard = {
  days: 7,
  views: 0,
  visitors: 0,
  clicks: 0,
  liveNow: 0,
  todayVisitors: 0,
  daily: [],
  countries: [],
  pages: [],
  referrers: [],
  devices: [],
  browsers: [],
  os: [],
  topProducts: [],
  recent: [],
};

export function getDashboard(days: number): Promise<Dashboard> {
  return safe(async () => {
    const since = sql`created_at >= now() - make_interval(days => ${days}::int)`;

    const [
      totals,
      clickTotal,
      live,
      today,
      dailyViews,
      dailyClicks,
      countries,
      countryClicks,
      pages,
      referrers,
      devices,
      browsers,
      os,
      topProducts,
      recent,
    ] = await Promise.all([
      sql<{ views: number; visitors: number }[]>`
        select count(*)::int as views, count(distinct visitor_hash)::int as visitors
        from page_views where ${since}`,
      sql<{ n: number }[]>`select count(*)::int as n from clicks where ${since}`,
      sql<{ n: number }[]>`
        select count(distinct visitor_hash)::int as n from page_views
        where created_at >= now() - interval '5 minutes'`,
      sql<{ n: number }[]>`
        select count(distinct visitor_hash)::int as n from page_views
        where (created_at at time zone ${TZ})::date = (now() at time zone ${TZ})::date`,
      sql<{ day: string; views: number; visitors: number }[]>`
        select to_char((created_at at time zone ${TZ})::date, 'YYYY-MM-DD') as day,
               count(*)::int as views, count(distinct visitor_hash)::int as visitors
        from page_views where ${since}
        group by 1 order by 1`,
      sql<{ day: string; clicks: number }[]>`
        select to_char((created_at at time zone ${TZ})::date, 'YYYY-MM-DD') as day, count(*)::int as clicks
        from clicks where ${since}
        group by 1 order by 1`,
      sql<{ country: string | null; views: number; visitors: number }[]>`
        select country, count(*)::int as views, count(distinct visitor_hash)::int as visitors
        from page_views where ${since}
        group by country order by visitors desc, views desc limit 25`,
      sql<{ country: string | null; clicks: number }[]>`
        select country, count(*)::int as clicks from clicks where ${since} group by country`,
      sql<Row[]>`
        select path as label, count(*)::int as value, count(distinct visitor_hash)::int as extra
        from page_views where ${since}
        group by path order by value desc limit 10`,
      sql<Row[]>`
        select coalesce(referrer, 'Direct / none') as label, count(distinct visitor_hash)::int as value
        from page_views where ${since}
        group by 1 order by value desc limit 10`,
      sql<Row[]>`
        select coalesce(device, 'Unknown') as label, count(distinct visitor_hash)::int as value
        from page_views where ${since} group by 1 order by value desc`,
      sql<Row[]>`
        select coalesce(browser, 'Unknown') as label, count(distinct visitor_hash)::int as value
        from page_views where ${since} group by 1 order by value desc limit 8`,
      sql<Row[]>`
        select coalesce(os, 'Unknown') as label, count(distinct visitor_hash)::int as value
        from page_views where ${since} group by 1 order by value desc limit 8`,
      sql<{ id: number | null; title: string | null; slug: string | null; clicks: number }[]>`
        select p.id, p.title, p.slug, count(*)::int as clicks
        from clicks c left join products p on p.id = c.product_id
        where c.created_at >= now() - make_interval(days => ${days}::int)
        group by p.id, p.title, p.slug order by clicks desc limit 10`,
      sql<RecentVisit[]>`
        select id, path, referrer, country, city, device, browser, os, created_at
        from page_views order by created_at desc limit 20`,
    ]);

    // Fill every day in the range so the chart has no gaps
    const viewsByDay = new Map(dailyViews.map((d) => [d.day, d]));
    const clicksByDay = new Map(dailyClicks.map((d) => [d.day, d.clicks]));
    const daily: Dashboard["daily"] = [];
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
    for (let i = days - 1; i >= 0; i--) {
      const day = fmt.format(new Date(Date.now() - i * 86_400_000));
      const v = viewsByDay.get(day);
      daily.push({ day, views: v?.views ?? 0, visitors: v?.visitors ?? 0, clicks: clicksByDay.get(day) ?? 0 });
    }

    const clicksByCountry = new Map(countryClicks.map((c) => [c.country, c.clicks]));

    return {
      days,
      views: totals[0]?.views ?? 0,
      visitors: totals[0]?.visitors ?? 0,
      clicks: clickTotal[0]?.n ?? 0,
      liveNow: live[0]?.n ?? 0,
      todayVisitors: today[0]?.n ?? 0,
      daily,
      countries: countries.map((c) => ({ ...c, clicks: clicksByCountry.get(c.country) ?? 0 })),
      pages: [...pages],
      referrers: [...referrers],
      devices: [...devices],
      browsers: [...browsers],
      os: [...os],
      topProducts: [...topProducts],
      recent: [...recent],
    };
  }, { ...EMPTY, days });
}

export const VISITS_PAGE_SIZE = 50;

export function getVisits(opts: { country?: string; page?: number }) {
  return safe(
    async () => {
      const page = Math.max(opts.page ?? 1, 1);
      const filter =
        opts.country === "unknown"
          ? sql`where country is null`
          : opts.country
            ? sql`where country = ${opts.country}`
            : sql``;
      const [rows, total, countries] = await Promise.all([
        sql<RecentVisit[]>`
          select id, path, referrer, country, city, device, browser, os, created_at
          from page_views ${filter}
          order by created_at desc
          limit ${VISITS_PAGE_SIZE} offset ${(page - 1) * VISITS_PAGE_SIZE}`,
        sql<{ n: number }[]>`select count(*)::int as n from page_views ${filter}`,
        sql<{ country: string | null; n: number }[]>`
          select country, count(*)::int as n from page_views
          where created_at >= now() - interval '90 days'
          group by country order by n desc limit 60`,
      ]);
      return { rows: [...rows], total: total[0]?.n ?? 0, countries: [...countries] };
    },
    { rows: [] as RecentVisit[], total: 0, countries: [] as { country: string | null; n: number }[] },
  );
}

/** Deletes analytics rows older than `days` days. Returns number of deleted rows. */
export async function deleteOldAnalytics(days: number): Promise<number> {
  const a = await sql`delete from page_views where created_at < now() - make_interval(days => ${days}::int)`;
  const b = await sql`delete from clicks where created_at < now() - make_interval(days => ${days}::int)`;
  return a.count + b.count;
}
