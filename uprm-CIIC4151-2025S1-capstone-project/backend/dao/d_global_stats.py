from load import load_db
from constants import CATEGORY_TO_DEPARTMENT
class GlobalStatsDAO:
    def __init__(self): self.conn = load_db()

    def avg_resolution_days(self):
        q = """SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/86400.0) FROM reports WHERE status='RESOLVED'"""
        with self.conn, self.conn.cursor() as cur: cur.execute(q); return float(cur.fetchone()[0] or 0)

    def top_departments_resolved(self, n):
        q = """SELECT department, COUNT(*) FROM reports WHERE status='RESOLVED' GROUP BY department ORDER BY 2 DESC LIMIT %s"""
        with self.conn, self.conn.cursor() as cur: cur.execute(q, (n,)); return [{"department": r[0], "count": r[1]} for r in cur.fetchall()]

    def top_users_reports(self, n):
        q = """SELECT created_by, COUNT(*) FROM reports GROUP BY created_by ORDER BY 2 DESC LIMIT %s"""
        with self.conn, self.conn.cursor() as cur: cur.execute(q, (n,)); return [{"user_id": r[0], "count": r[1]} for r in cur.fetchall()]

    def top_admins_validated(self, n):
        q = """SELECT validated_by, COUNT(*) FROM reports WHERE validated_by IS NOT NULL GROUP BY validated_by ORDER BY 2 DESC LIMIT %s"""
        with self.conn, self.conn.cursor() as cur: cur.execute(q, (n,)); return [{"admin_id": r[0], "count": r[1]} for r in cur.fetchall()]

    def top_admins_resolved(self, n):
        q = """SELECT resolved_by, COUNT(*) FROM reports WHERE status='RESOLVED' GROUP BY resolved_by ORDER BY 2 DESC LIMIT %s"""
        with self.conn, self.conn.cursor() as cur: cur.execute(q, (n,)); return [{"admin_id": r[0], "count": r[1]} for r in cur.fetchall()]

    def resolution_rate_by_department(self):
    # 1) Get raw counts per category
        q = """
            SELECT
                category,
                COUNT(*) FILTER (WHERE status = 'resolved')::numeric AS resolved_count,
                COUNT(*)::numeric AS total_count
            FROM reports
            GROUP BY category;
        """
        with self.conn, self.conn.cursor() as cur:
            cur.execute(q)
            rows = cur.fetchall()

        # 2) Aggregate by department using CATEGORY_TO_DEPARTMENT mapping
        dept_stats: dict[str, dict[str, float]] = {}

        for category, resolved_count, total_count in rows:
            # Map category -> department (LUMA, DTOP, AAA, DDS, etc.)
            department = CATEGORY_TO_DEPARTMENT.get(category)

            # Skip categories that don't map to a department (e.g. "other")
            if not department:
                continue

            if department not in dept_stats:
                dept_stats[department] = {"resolved": 0.0, "total": 0.0}

            dept_stats[department]["resolved"] += float(resolved_count or 0.0)
            dept_stats[department]["total"] += float(total_count or 0.0)

        # 3) Build result list with resolution_rate per department
        result = []
        for department, stats in dept_stats.items():
            total = stats["total"]
            resolved = stats["resolved"]
            # percentage 0–100, rounded to 2 decimals
            rate = (resolved / total * 100) if total > 0 else 0.0
            result.append(
                {
                    "department": department,
                    "resolution_rate": round(float(rate), 2),
                }
            )

        # 4) Order by resolution_rate DESC
        result.sort(key=lambda x: x["resolution_rate"], reverse=True)
        return result


    def avg_resolution_time_by_department(self):
        q = """
            SELECT
                category,
                EXTRACT(EPOCH FROM (resolved_at - created_at)) AS seconds
            FROM reports
            WHERE resolved_at IS NOT NULL;
        """
        with self.conn, self.conn.cursor() as cur:
            cur.execute(q)
            rows = cur.fetchall()

        dept_stats: dict[str, dict[str, float]] = {}

        for category, seconds in rows:
            department = CATEGORY_TO_DEPARTMENT.get(category)

            if not department:
                continue

            if department not in dept_stats:
                dept_stats[department] = {"sum_seconds": 0.0, "count": 0}

            if seconds is not None:
                dept_stats[department]["sum_seconds"] += float(seconds)
                dept_stats[department]["count"] += 1

        result = []
        for department, stats in dept_stats.items():
            count = stats["count"]
            sum_seconds = stats["sum_seconds"]

            if count > 0:
                avg_seconds = sum_seconds / count

                days = int(avg_seconds // 86400)
                hours = int((avg_seconds % 86400) // 3600)
            else:
                days = 0
                hours = 0

            result.append({
                "department": department,
                "avg_days": days,
                "avg_hours": hours
            })

        result.sort(key=lambda x: (x["avg_days"], x["avg_hours"]))

        return result



    def monthly_report_volume(self, months):
        q = """
            SELECT
                to_char(date_trunc('month', created_at), 'FMMonth') AS month,
                COUNT(*) AS count
            FROM reports
            WHERE created_at >= (DATE '2025-01-01')
            GROUP BY 1, date_trunc('month', created_at)
            ORDER BY date_trunc('month', created_at) ASC;


        """
        with self.conn, self.conn.cursor() as cur:
            cur.execute(q, (months,))
            rows = cur.fetchall()
        return [{"month": r[0], "count": r[1]} for r in rows]

    def top_categories_percentage(self, n):
        q = """
            WITH totals AS ( SELECT COUNT(*)::numeric AS total FROM reports )
            SELECT
                category,
                COUNT(*) AS count,
                ROUND(
                CASE
                    WHEN total > 0 THEN (COUNT(*)::numeric / total) * 100
                    ELSE 0
                END
                ,2) AS percentage
            FROM reports, totals
            GROUP BY category, total
            ORDER BY count DESC
            LIMIT %s;
        """
        with self.conn, self.conn.cursor() as cur:
            cur.execute(q, (n,))
            rows = cur.fetchall()

        return [
            {
                "category": r[0],
                "count": r[1],
                "percentage": float(r[2] or 0.0),
            }
            for r in rows
        ]

    
