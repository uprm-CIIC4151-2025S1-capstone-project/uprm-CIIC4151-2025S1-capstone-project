from dotenv import load_dotenv
from load import load_db
from typing import Optional

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
    # Location helpers
    # -------------------------------
    def search_locations_by_city(self, q: str | None = None, limit: int = 20, prefix: bool = False):
        """
        Return rows from `location` that match the city.
        Useful when you want a real location.id for each dropdown option.
        - q: search string
        - prefix: if True does prefix match (q%), otherwise contains match (%q%)
        """
        params = []
        if q:
            pattern = f"{q}%" if prefix else f"%{q}%"
            sql = """
                SELECT id, city
                FROM location
                WHERE city IS NOT NULL AND city ILIKE %s
                ORDER BY city
                LIMIT %s
            """
            params = [pattern, limit]
        else:
            sql = """
                SELECT id, city
                FROM location
                WHERE city IS NOT NULL
                ORDER BY city
                LIMIT %s
            """
            params = [limit]

        with self.conn.cursor() as cur:
            cur.execute(sql, params)
            return [{"id": r[0], "city": r[1]} for r in cur.fetchall()]

    def search_cities(self, q: str | None = None, limit: int = 20, prefix: bool = False, include_counts: bool = False):
        """
        Return distinct city names. If include_counts is True, also return how many reports exist per city.
        Useful for city-level filters where you don't want duplicates because multiple location rows share same city.
        Returns list of dicts:
          if include_counts False -> [{"city": "Carolina"} ...]
          if include_counts True  -> [{"city": "Carolina", "count": 142} ...]
        """
        params = []
        if include_counts:
            # join to reports to count per city (may be slower; consider caching)
            if q:
                pattern = f"{q}%" if prefix else f"%{q}%"
                sql = """
                    SELECT l.city, COUNT(r.id) as count
                    FROM location l
                    LEFT JOIN reports r ON r.location = l.id
                    WHERE l.city IS NOT NULL AND l.city ILIKE %s
                    GROUP BY l.city
                    ORDER BY l.city
                    LIMIT %s
                """
                params = [pattern, limit]
            else:
                sql = """
                    SELECT l.city, COUNT(r.id) as count
                    FROM location l
                    LEFT JOIN reports r ON r.location = l.id
                    WHERE l.city IS NOT NULL
                    GROUP BY l.city
                    ORDER BY l.city
                    LIMIT %s
                """
                params = [limit]
            with self.conn.cursor() as cur:
                cur.execute(sql, params)
                return [{"city": r[0], "count": r[1]} for r in cur.fetchall()]
        else:
            if q:
                pattern = f"{q}%" if prefix else f"%{q}%"
                sql = """
                    SELECT DISTINCT city
                    FROM location
                    WHERE city IS NOT NULL AND city ILIKE %s
                    ORDER BY city
                    LIMIT %s
                """
                params = [pattern, limit]
            else:
                sql = """
                    SELECT DISTINCT city
                    FROM location
                    WHERE city IS NOT NULL
                    ORDER BY city
                    LIMIT %s
                """
                params = [limit]
            with self.conn.cursor() as cur:
                cur.execute(sql, params)
                return [{"city": r[0]} for r in cur.fetchall()]

    # -------------------------------
    # Core list/read/write operations
    # -------------------------------
    def get_reports_paginated(
        self,
        limit: int,
        offset: int,
        sort: str | None = None,
        allowed_categories: list[str] | None = None,
        location_id: int | None = None,
        city: str | None = None,
    ):
        """Fetch reports with pagination and optional category / location restriction."""
        order_dir = _normalize_sort(sort)
        where_clauses: list[str] = []
        params: list = []

        if allowed_categories:
            where_clauses.append("reports.category = ANY(%s)")
            params.append(allowed_categories)

        if location_id is not None:
            where_clauses.append("reports.location = %s")
            params.append(location_id)

        if city:
            where_clauses.append("location.city = %s")
            params.append(city)

        where_sql = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        query = f"""
            SELECT reports.id, reports.title, reports.description, reports.status, reports.category,
                   reports.created_by, reports.validated_by, reports.resolved_by,
                   reports.created_at, reports.resolved_at,
                   reports.location, location.city AS city,
                   reports.image_url, reports.rating
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            {where_sql}
            ORDER BY reports.created_at {order_dir}, reports.id {order_dir}
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
            # Return as list of tuples (same form as previous) or map to dict if you prefer
            return rows

    def get_total_report_count(self, allowed_categories: list[str] | None = None, location_id: int | None = None, city: str | None = None):
        """Count reports, optionally restricted to a set of categories or location."""
        where_clauses: list[str] = []
        params: list = []

        if allowed_categories:
            where_clauses.append("category = ANY(%s)")
            params.append(allowed_categories)

        if location_id is not None:
            where_clauses.append("location = %s")
            params.append(location_id)

        if city:
            where_clauses.append("location.city = %s")
            params.append(city)

        where_sql = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
        query = f"""
            SELECT COUNT(*)
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            {where_sql}
        """

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()[0]


    def get_report_by_id(self, report_id: int):
        """Fetch a single report by ID (includes location.city)."""
        query = """
            SELECT reports.id, reports.title, reports.description, reports.status, reports.category,
                   reports.created_by, reports.validated_by, reports.resolved_by,
                   reports.created_at, reports.resolved_at,
                   reports.location, location.city AS city,
                   reports.image_url, reports.rating
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            WHERE reports.id = %s
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
            if not new_report:
                raise Exception("Report creation failed, no row returned from INSERT")
            
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
        """Update any fields of a report and return the updated row as a dict."""
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

            # Attempt to fetch the returned row
            row = cur.fetchone()

            # Debug info (remove or change to logger in production)
            print("DEBUG update_report rowcount:", cur.rowcount)
            print("DEBUG update_report returned row:", row)

            # commit after reading
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
        location_id: int | None = None,
        city: str | None = None,
    ):
        """
        Search and filter reports with pagination, sorting, and optional admin restrictions.
        You can filter by `location_id` (exact match) or by `city` (city name).
        Returns: (rows, total_count)
        """
        where = []
        params: list = []

        if q:
            where.append("(reports.title ILIKE %s OR reports.description ILIKE %s)")
            like = f"%{q}%"
            params.extend([like, like])
        if status:
            where.append("reports.status = %s")
            params.append(status)
        if category:
            where.append("reports.category = %s")
            params.append(category)
        if allowed_categories:
            where.append("reports.category = ANY(%s)")
            params.append(allowed_categories)
        if location_id is not None:
            where.append("reports.location = %s")
            params.append(location_id)
        if city:
            where.append("location.city = %s")
            params.append(city)

        where_sql = f" WHERE {' AND '.join(where)}" if where else ""
        order_dir = _normalize_sort(sort)

        count_sql = f"""
            SELECT COUNT(*)
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            {where_sql}
        """
        data_sql = f"""
            SELECT reports.id, reports.title, reports.description, reports.status, reports.category,
                   reports.created_by, reports.validated_by, reports.resolved_by,
                   reports.created_at, reports.resolved_at,
                   reports.location, location.city AS city,
                   reports.image_url, reports.rating
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            {where_sql}
            ORDER BY reports.created_at {order_dir}, reports.id {order_dir}
            LIMIT %s OFFSET %s
        """

        with self.conn.cursor() as cur:
            cur.execute(count_sql, params)
            total_count = cur.fetchone()[0]

            cur.execute(data_sql, params + [limit, offset])
            rows = cur.fetchall()

        return rows, total_count

    def get_user_rating_status(self, report_id: int, user_id: int):
        """
        Returns whether the user has rated the given report and the current cached rating.
        Returns: {"rated": bool, "rating": int}
        """
        query_exists = """
            SELECT 1 FROM report_ratings WHERE report_id = %s AND user_id = %s LIMIT 1
        """
        query_rating = "SELECT rating FROM reports WHERE id = %s"
        with self.conn.cursor() as cur:
            cur.execute(query_exists, (report_id, user_id))
            rated = cur.fetchone() is not None

            cur.execute(query_rating, (report_id,))
            r = cur.fetchone()
            cached_rating = r[0] if r else 0

            return {"rated": rated, "rating": cached_rating}


    def get_report_rating_stats(self, report_id: int):
        """
        Returns rating stats for a report.
        - total_ratings: count from report_ratings (canonical)
        - cached_rating: reports.rating (fast read; should match total_ratings)
        - distribution: simple distribution object (for UI compatibility)
        """
        count_query = "SELECT COUNT(*) FROM report_ratings WHERE report_id = %s"
        cached_query = "SELECT rating FROM reports WHERE id = %s"

        with self.conn.cursor() as cur:
            cur.execute(count_query, (report_id,))
            total = cur.fetchone()[0]

            cur.execute(cached_query, (report_id,))
            cached = cur.fetchone()
            cached_rating = cached[0] if cached else 0

            distribution = {"1": total}

            return {
                "total_ratings": total,
                "cached_rating": cached_rating,
                "distribution": distribution,
            }

    # -------------------------------
    # User-specific reports
    # -------------------------------
    def get_reports_by_user(self, user_id: int, limit: int, offset: int, sort: str | None = None):
        order_dir = _normalize_sort(sort)
        query = f"""
            SELECT reports.id, reports.title, reports.description, reports.status, reports.category,
                   reports.created_by, reports.validated_by, reports.resolved_by,
                   reports.created_at, reports.resolved_at,
                   reports.location, location.city AS city,
                   reports.image_url, reports.rating
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            WHERE reports.created_by = %s
            ORDER BY reports.created_at {order_dir}, reports.id {order_dir}
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
            SELECT
                COUNT(*) as total_reports,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_reports,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_reports,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
                COUNT(CASE WHEN status = 'denied' THEN 1 END) as denied_reports,
                COUNT(DISTINCT created_by) as unique_reporters,
                COALESCE(AVG(rating), 0) as avg_rating,
                COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as rated_reports
            FROM reports
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
                "unique_reporters": result[5],
                "avg_rating": float(result[6]) if result[6] else 0,
                "rated_reports": result[7],
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
            SELECT reports.id, reports.title, reports.status, reports.category, reports.created_at,
                   location.city AS city
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            ORDER BY reports.created_at DESC
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
                    {
                        "id": r[0],
                        "title": r[1],
                        "status": r[2],
                        "category": r[3],
                        "created_at": r[4],
                        "city": r[5],
                    }
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
            SELECT reports.id, reports.title, reports.description, reports.status, reports.category,
                   reports.created_by, reports.validated_by, reports.resolved_by,
                   reports.created_at, reports.resolved_at,
                   reports.location, location.city AS city,
                   reports.image_url, reports.rating
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            WHERE reports.status = 'open'
            ORDER BY reports.created_at {order_dir}, reports.id {order_dir}
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
            SELECT reports.id, reports.title, reports.description, reports.status, reports.category,
                   reports.created_by, reports.validated_by, reports.resolved_by,
                   reports.created_at, reports.resolved_at,
                   reports.location, location.city AS city,
                   reports.image_url, reports.rating
            FROM reports
            LEFT JOIN location ON reports.location = location.id
            WHERE (reports.validated_by = %s OR reports.resolved_by = %s) AND reports.status != 'resolved'
            ORDER BY reports.created_at {order_dir}, reports.id {order_dir}
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
        
    def rate_report(self, report_id: int, user_id: int):
        """
        Add a rating from user_id to report_id.
        Returns dict: {"rating": int, "added": bool}
        """
        insert_query = """
            INSERT INTO report_ratings (report_id, user_id)
            VALUES (%s, %s)
            ON CONFLICT (report_id, user_id) DO NOTHING
        """
        increment_query = """
            UPDATE reports
            SET rating = rating + 1
            WHERE id = %s
            RETURNING rating
        """
        select_rating_query = "SELECT rating FROM reports WHERE id = %s"

        with self.conn.cursor() as cur:
            # Try to insert the user-rating (will DO NOTHING if conflict)
            cur.execute(insert_query, (report_id, user_id))
            inserted = cur.rowcount > 0

            if inserted:
                # Only increment cached counter when we actually inserted
                cur.execute(increment_query, (report_id,))
                # increment_query returns the updated rating
                updated = cur.fetchone()
                new_rating = updated[0] if updated else None
            else:
                # No insert -> fetch current rating
                cur.execute(select_rating_query, (report_id,))
                r = cur.fetchone()
                new_rating = r[0] if r else None

            self.conn.commit()
            return {"rating": new_rating if new_rating is not None else 0, "added": inserted}
        
    def unrate_report(self, report_id: int, user_id: int):
        """
        Remove user's rating for a report (unstar).
        Returns dict: {"rating": int, "removed": bool}
        """
        delete_query = """
            DELETE FROM report_ratings
            WHERE report_id = %s AND user_id = %s
        """
        decrement_query = """
            UPDATE reports
            SET rating = GREATEST(rating - 1, 0)
            WHERE id = %s
            RETURNING rating
        """
        select_rating_query = "SELECT rating FROM reports WHERE id = %s"

        with self.conn.cursor() as cur:
            cur.execute(delete_query, (report_id, user_id))
            removed = cur.rowcount > 0

            if removed:
                # Only decrement cached counter when a rating was removed
                cur.execute(decrement_query, (report_id,))
                updated = cur.fetchone()
                new_rating = updated[0] if updated else None
            else:
                cur.execute(select_rating_query, (report_id,))
                r = cur.fetchone()
                new_rating = r[0] if r else None

            self.conn.commit()
            return {"rating": new_rating if new_rating is not None else 0, "removed": removed}

    def toggle_report_rating(self, report_id: int, user_id: int) -> dict:
        """
        Toggle a user's rating on a report.
        Returns a dict: {"rating": int, "toggled_on": bool}
        """
        # Check if user already rated
        with self.conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM report_ratings WHERE report_id = %s AND user_id = %s LIMIT 1",
                (report_id, user_id),
            )
            exists = cur.fetchone() is not None

        if exists:
            result = self.unrate_report(report_id, user_id)  # returns {"rating": int, "removed": bool}
            # Return a normalized shape
            return {"rating": result.get("rating", 0), "toggled_on": False}
        else:
            result = self.rate_report(report_id, user_id)  # returns {"rating": int, "added": bool}
            return {"rating": result.get("rating", 0), "toggled_on": True}


    # -------------------------------
    # Cleanup
    # -------------------------------
    def close(self):
        if self.conn:
            self.conn.close()
