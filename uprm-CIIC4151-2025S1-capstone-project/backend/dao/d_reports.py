from dotenv import load_dotenv
from load import load_db


def _normalize_sort(sort: str | None) -> str:
    """
    Whitelist sort direction to prevent SQL injection.
    Returns 'ASC' or 'DESC'. Default is 'DESC'.
    """
    if not sort:
        return "DESC"
    s = sort.strip().upper()
    return "ASC" if s == "ASC" else "DESC"


class ReportsDAO:
    def __init__(self):
        load_dotenv()
        self.conn = load_db()

    # -------------------------------
    # Core list/read/write operations
    # -------------------------------
    def get_reports_paginated(
        self,
        limit: int,
        offset: int,
        sort: str | None = None,
        allowed_categories: list[str] | None = None,
    ):
        """Fetch reports with pagination and optional category restriction."""
        order_dir = _normalize_sort(sort)
        where_clauses: list[str] = []
        params: list = []

        if allowed_categories:
            where_clauses.append("category = ANY(%s)")
            params.append(allowed_categories)

        where_sql = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        query = f"""
            SELECT id, title, description, status, category, created_by,
                   validated_by, resolved_by, created_at, resolved_at,
                   location, image_url, rating
            FROM reports
            {where_sql}
            ORDER BY created_at {order_dir}, id {order_dir}
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def get_total_report_count(self, allowed_categories: list[str] | None = None):
        """Count reports, optionally restricted to a set of categories."""
        where_clauses: list[str] = []
        params: list = []

        if allowed_categories:
            where_clauses.append("category = ANY(%s)")
            params.append(allowed_categories)

        where_sql = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
        query = f"SELECT COUNT(*) FROM reports{where_sql}"

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()[0]

    def get_report_by_id(self, report_id: int):
        """Fetch a single report by ID."""
        query = """
            SELECT id, title, description, status, category, created_by,
                   validated_by, resolved_by, created_at, resolved_at,
                   location, image_url, rating
            FROM reports
            WHERE id = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (report_id,))
            return cur.fetchone()

    def create_report(
        self,
        title: str,
        description: str,
        category: str = "other",
        location_id: int | None = None,
        image_url: str | None = None,
        created_by: int | None = None,
    ):
        """Insert a new report and increment user's total_reports."""
        query = """
            INSERT INTO reports (title, description, category, location, image_url, created_by)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, title, description, status, category, created_by,
                      validated_by, resolved_by, created_at, resolved_at,
                      location, image_url, rating
        """
        with self.conn.cursor() as cur:
            cur.execute(
                query, (title, description, category, location_id, image_url, created_by)
            )
            new_report = cur.fetchone()
            if created_by is not None:
                cur.execute(
                    "UPDATE users SET total_reports = total_reports + 1 WHERE id = %s",
                    (created_by,),
                )
            self.conn.commit()
            return new_report

    def update_report(
        self,
        report_id: int,
        status: str | None = None,
        rating: int | None = None,
        title: str | None = None,
        description: str | None = None,
        category: str | None = None,
        validated_by: int | None = None,
        resolved_by: int | None = None,
        resolved_at: str | None = None,
        location_id: int | None = None,
        image_url: str | None = None,
    ):
        """Update any fields of a report and return the updated row."""
        fields = []
        params = []

        if status is not None:
            fields.append("status = %s")
            params.append(status)
        if rating is not None:
            fields.append("rating = %s")
            params.append(rating)
        if title is not None:
            fields.append("title = %s")
            params.append(title)
        if description is not None:
            fields.append("description = %s")
            params.append(description)
        if category is not None:
            fields.append("category = %s")
            params.append(category)
        if validated_by is not None:
            fields.append("validated_by = %s")
            params.append(validated_by)
        if resolved_by is not None:
            fields.append("resolved_by = %s")
            params.append(resolved_by)
        if resolved_at is not None:
            if resolved_at == "NOW()":
                fields.append("resolved_at = NOW()")
            else:
                fields.append("resolved_at = %s")
                params.append(resolved_at)
        if location_id is not None:
            fields.append("location = %s")
            params.append(location_id)
        if image_url is not None:
            fields.append("image_url = %s")
            params.append(image_url)

        if not fields:
            return None

        query = f"""
            UPDATE reports
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING id, title, description, status, category, created_by,
                      validated_by, resolved_by, created_at, resolved_at,
                      location, image_url, rating
        """
        params.append(report_id)

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            self.conn.commit()
            return cur.fetchone()

    def delete_report(self, report_id: int):
        """Delete a report by ID, return True if deleted."""
        query = """
            DELETE FROM reports
            WHERE id = %s
            RETURNING id
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (report_id,))
            self.conn.commit()
            return cur.fetchone() is not None

    # ------------------------------------------------------------
    # Unified search + filter + sort (with admin category restriction)
    # ------------------------------------------------------------
    def search_reports(
        self,
        q: str | None = None,
        status: str | None = None,
        category: str | None = None,
        limit: int = 10,
        offset: int = 0,
        sort: str | None = None,
        allowed_categories: list[str] | None = None,
    ):
        """Search and filter reports with pagination, sorting, and optional admin restrictions."""
        where = []
        params: list = []

        if q:
            where.append("(title ILIKE %s OR description ILIKE %s)")
            like = f"%{q}%"
            params.extend([like, like])
        if status:
            where.append("status = %s")
            params.append(status)
        if category:
            where.append("category = %s")
            params.append(category)
        if allowed_categories:
            where.append("category = ANY(%s)")
            params.append(allowed_categories)

        where_sql = f" WHERE {' AND '.join(where)}" if where else ""
        order_dir = _normalize_sort(sort)

        count_sql = f"SELECT COUNT(*) FROM reports{where_sql}"
        data_sql = f"""
            SELECT id, title, description, status, category, created_by,
                   validated_by, resolved_by, created_at, resolved_at,
                   location, image_url, rating
            FROM reports
            {where_sql}
            ORDER BY created_at {order_dir}, id {order_dir}
            LIMIT %s OFFSET %s
        """

        with self.conn.cursor() as cur:
            cur.execute(count_sql, params)
            total_count = cur.fetchone()[0]

            cur.execute(data_sql, params + [limit, offset])
            rows = cur.fetchall()

        return rows, total_count

    def get_user_rating_status(self, report_id, user_id):
        """Check if a user has rated a specific report"""
        query = """
            SELECT rating
            FROM reports
            WHERE id = %s AND created_by = %s AND rating IS NOT NULL
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (report_id, user_id))
            result = cur.fetchone()

            if result:
                return {"rated": True, "rating": result[0]}
            else:
                return {"rated": False, "rating": None}

    def get_report_rating_stats(self, report_id):
        """Get overall rating statistics for a report"""
        # Get average rating and total ratings
        query = """
            SELECT
                COALESCE(AVG(rating), 0) as average_rating,
                COUNT(rating) as total_ratings
            FROM reports
            WHERE id = %s AND rating IS NOT NULL
        """

        # Get rating distribution
        distribution_query = """
            SELECT
                rating,
                COUNT(*) as count
            FROM reports
            WHERE id = %s AND rating IS NOT NULL
            GROUP BY rating
            ORDER BY rating
        """

        with self.conn.cursor() as cur:
            # Get average and total
            cur.execute(query, (report_id,))
            stats_result = cur.fetchone()

            # Get distribution
            cur.execute(distribution_query, (report_id,))
            distribution_results = cur.fetchall()

            # Build distribution dictionary
            distribution = {}
            for rating, count in distribution_results:
                distribution[str(rating)] = count

            return {
                "average_rating": float(stats_result[0]) if stats_result[0] else 0,
                "total_ratings": stats_result[1],
                "distribution": distribution,
            }

    # -------------------------------
    # User-specific reports
    # -------------------------------
    def get_reports_by_user(self, user_id: int, limit: int, offset: int, sort: str | None = None):
        order_dir = _normalize_sort(sort)
        query = f"""
            SELECT id, title, description, status, category, created_by,
                   validated_by, resolved_by, created_at, resolved_at,
                   location, image_url, rating
            FROM reports
            WHERE created_by = %s
            ORDER BY created_at {order_dir}, id {order_dir}
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, limit, offset))
            return cur.fetchall()

    def get_user_reports_count(self, user_id: int):
        query = "SELECT COUNT(*) FROM reports WHERE created_by = %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone()[0]

    # -------------------------------
    # Dashboard / Stats
    # -------------------------------
    def get_overview_stats(self):
        query = """
            WITH report_stats AS (
                SELECT
                    COUNT(*) as total_reports,
                    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_reports,
                    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_reports,
                    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
                    COUNT(CASE WHEN status = 'denied' THEN 1 END) as denied_reports,
                    COALESCE(AVG(rating), 0) as avg_rating
                FROM reports
            ),
            user_stats AS (
                SELECT COUNT(*) as total_users FROM users
            ),
            pinned_stats AS (
                SELECT COUNT(*) as pinned_reports_count FROM pinned_reports
            )
            SELECT
                rs.total_reports,
                rs.open_reports,
                rs.in_progress_reports,
                rs.resolved_reports,
                rs.denied_reports,
                rs.resolved_reports + rs.denied_reports as closed_reports,
                rs.avg_rating,
                us.total_users,
                ps.pinned_reports_count
            FROM report_stats rs, user_stats us, pinned_stats ps
        """
        with self.conn.cursor() as cur:
            cur.execute(query)
            result = cur.fetchone()
            return {
                "total_reports": result[0],
                "open_reports": result[1],
                "in_progress_reports": result[2],
                "resolved_reports": result[3],
                "denied_reports": result[4],
                "closed_reports": result[5],
                "avg_rating": float(result[6]) if result[6] else 0,
                "total_users": result[7],
                "pinned_reports_count": result[8],
            }

    def get_department_stats(self, department: str):
        query = """
            SELECT
                d.department,
                COUNT(r.id) as total_reports,
                COUNT(CASE WHEN r.status = 'open' THEN 1 END) as open_reports,
                COUNT(CASE WHEN r.status = 'in_progress' THEN 1 END) as in_progress_reports,
                COUNT(CASE WHEN r.status = 'resolved' THEN 1 END) as resolved_reports,
                COALESCE(AVG(r.rating), 0) as avg_rating
            FROM department_admins d
            LEFT JOIN administrators a ON d.admin_id = a.id
            LEFT JOIN reports r ON (r.validated_by = a.id OR r.resolved_by = a.id)
            WHERE d.department = %s
            GROUP BY d.department
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (department,))
            result = cur.fetchone()
            if not result:
                return None
            return {
                "department": result[0],
                "total_reports": result[1],
                "open_reports": result[2],
                "in_progress_reports": result[3],
                "resolved_reports": result[4],
                "avg_rating": float(result[5]) if result[5] else 0,
            }

    def get_admin_dashboard(self):
        recent_reports_query = """
            SELECT id, title, status, category, created_at
            FROM reports
            ORDER BY created_at DESC
            LIMIT 10
        """
        category_stats_query = """
            SELECT category, COUNT(*),
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
            FROM reports
            GROUP BY category
        """
        status_stats_query = "SELECT status, COUNT(*) FROM reports GROUP BY status"

        with self.conn.cursor() as cur:
            cur.execute(recent_reports_query)
            recent_reports = cur.fetchall()
            cur.execute(category_stats_query)
            category_stats = cur.fetchall()
            cur.execute(status_stats_query)
            status_stats = cur.fetchall()

            return {
                "recent_reports": [
                    {"id": r[0], "title": r[1], "status": r[2], "category": r[3], "created_at": r[4]}
                    for r in recent_reports
                ],
                "category_stats": [{"category": s[0], "total": s[1], "resolved": s[2]} for s in category_stats],
                "status_stats": [{"status": s[0], "count": s[1]} for s in status_stats],
            }

    # -------------------------------
    # Pending / Assigned reports
    # -------------------------------
    def get_pending_reports(self, limit: int, offset: int, sort: str | None = None):
        order_dir = _normalize_sort(sort)
        query = f"""
            SELECT id, title, description, status, category, created_by,
                   validated_by, resolved_by, created_at, resolved_at,
                   location, image_url, rating
            FROM reports
            WHERE status = 'open'
            ORDER BY created_at {order_dir}, id {order_dir}
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            return cur.fetchall()

    def get_pending_reports_count(self):
        query = "SELECT COUNT(*) FROM reports WHERE status = 'open'"
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchone()[0]

    def get_assigned_reports(self, admin_id: int, limit: int, offset: int, sort: str | None = None):
        order_dir = _normalize_sort(sort)
        query = f"""
            SELECT id, title, description, status, category, created_by,
                   validated_by, resolved_by, created_at, resolved_at,
                   location, image_url, rating
            FROM reports
            WHERE (validated_by = %s OR resolved_by = %s) AND status != 'resolved'
            ORDER BY created_at {order_dir}, id {order_dir}
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (admin_id, admin_id, limit, offset))
            return cur.fetchall()

    def get_assigned_reports_count(self, admin_id: int):
        query = """
            SELECT COUNT(*) FROM reports
            WHERE (validated_by = %s OR resolved_by = %s) AND status != 'resolved'
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (admin_id, admin_id))
            return cur.fetchone()[0]

    # -------------------------------
    # Cleanup
    # -------------------------------
    def close(self):
        if self.conn:
            self.conn.close()
