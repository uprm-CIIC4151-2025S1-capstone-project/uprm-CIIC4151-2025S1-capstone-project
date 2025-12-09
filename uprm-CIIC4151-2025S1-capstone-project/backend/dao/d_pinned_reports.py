# dao/d_pinned_reports.py
from dotenv import load_dotenv
from load import load_db


class PinnedReportsDAO:
    def __init__(self):
        load_dotenv()
        self.conn = load_db()

    def get_pinned_report(self, user_id, report_id):
        """
        Return (user_id, report_id, pinned_at) or None
        """
        query = "SELECT user_id, report_id, pinned_at FROM pinned_reports WHERE user_id = %s AND report_id = %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, report_id))
            return cur.fetchone()

    def pin_report(self, user_id, report_id):
        """
        Idempotent insert. Returns (user_id, report_id, pinned_at) if newly inserted,
        or None if it was already present.
        """
        query = """
            INSERT INTO pinned_reports (user_id, report_id, pinned_at)
            VALUES (%s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, report_id) DO NOTHING
            RETURNING user_id, report_id, pinned_at
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, report_id))
            row = cur.fetchone()
            # commit whether inserted or not (safe to commit after SELECT RETURNING)
            self.conn.commit()
            return row  # tuple or None

    def unpin_report(self, user_id, report_id):
        """
        Delete the pinned row. Returns (user_id, report_id) if deleted, otherwise None.
        """
        query = """
            DELETE FROM pinned_reports
            WHERE user_id = %s AND report_id = %s
            RETURNING user_id, report_id
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, report_id))
            deleted = cur.fetchone()
            self.conn.commit()
            return deleted  # tuple or None

    def get_pinned_reports_by_user(self, user_id, limit, offset):
        """
        Returns list of rows where each row is:
        (user_id, report_id, pinned_at, title, description, status, category, created_at)
        """
        query = """
            SELECT pr.user_id, pr.report_id, pr.pinned_at, r.title, r.description, r.status, r.category, r.created_at
            FROM pinned_reports pr
            JOIN reports r ON pr.report_id = r.id
            WHERE pr.user_id = %s
            ORDER BY pr.pinned_at DESC
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, limit, offset))
            return cur.fetchall()

    def get_pinned_reports_count_by_user(self, user_id):
        query = "SELECT COUNT(*) FROM pinned_reports WHERE user_id = %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone()[0]

    def get_all_pinned_reports(self, limit, offset):
        query = """
            SELECT pr.user_id, pr.report_id, pr.pinned_at, r.title, r.description, r.status, r.category, r.created_at
            FROM pinned_reports pr
            JOIN reports r ON pr.report_id = r.id
            ORDER BY pr.pinned_at DESC
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            return cur.fetchall()

    def get_total_pinned_reports_count(self):
        query = "SELECT COUNT(*) FROM pinned_reports"
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchone()[0]

    def get_user_pinned_reports(self, user_id, limit, offset):
        """Alias for get_pinned_reports_by_user for consistency"""
        return self.get_pinned_reports_by_user(user_id, limit, offset)

    def is_report_pinned_by_user(self, user_id, report_id):
        """Return True if pinned, False otherwise"""
        query = "SELECT 1 FROM pinned_reports WHERE user_id = %s AND report_id = %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, report_id))
            return cur.fetchone() is not None

    def get_pinned_report_details(self, user_id, report_id):
        """
        Returns (user_id, report_id, pinned_at, title, description, status, category, created_at, location, image_url, rating)
        or None
        """
        query = """
            SELECT pr.user_id, pr.report_id, pr.pinned_at, r.title, r.description, r.status, r.category,
                   r.created_at, r.location, r.image_url, r.rating
            FROM pinned_reports pr
            JOIN reports r ON pr.report_id = r.id
            WHERE pr.user_id = %s AND pr.report_id = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, report_id))
            return cur.fetchone()

    def close(self):
        if self.conn:
            self.conn.close()
