from dotenv import load_dotenv
from load import load_db

# Add near the top if not present
VALID_DEPARTMENTS = ("DTOP", "LUMA", "AAA", "DDS")


class UsersDAO:

    def __init__(self):
        load_dotenv()
        self.conn = load_db()

    def get_users_paginated(self, limit, offset):
        query = """
            SELECT id, email, password, admin, suspended, pinned, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            return cur.fetchall()

    def get_total_user_count(self):
        query = "SELECT COUNT(*) FROM users"
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchone()[0]

    def get_all_users(self):
        query = """
            SELECT id, email, password, admin, suspended, pinned, created_at
            FROM users
            ORDER BY created_at DESC
        """
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    def get_user_by_email(self, email):
        query = """
            SELECT id, email, password, admin, suspended, pinned, created_at
            FROM users
            WHERE email = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (email,))
            return cur.fetchone()

    def get_user_by_id(self, user_id):
        query = """
            SELECT id, email, password, admin, suspended, pinned, created_at
            FROM users
            WHERE id = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone()

    def create_user(self, email, password, admin=False):
        query = """
            INSERT INTO users (email, password, admin)
            VALUES (%s, %s, %s)
            RETURNING id, email, password, admin, suspended, pinned, created_at
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (email, password, admin))
            self.conn.commit()
            return cur.fetchone()

    def update_user(
        self,
        user_id,
        email=None,
        password=None,
        admin=None,
        suspended=None,
        pinned=None,
    ):
        # Build dynamic query based on provided fields
        fields = []
        params = []

        if email is not None:
            fields.append("email = %s")
            params.append(email)
        if password is not None:
            fields.append("password = %s")
            params.append(password)
        if admin is not None:
            fields.append("admin = %s")
            params.append(admin)
        if suspended is not None:
            fields.append("suspended = %s")
            params.append(suspended)
        if pinned is not None:
            fields.append("pinned = %s")
            params.append(pinned)

        if not fields:
            return None

        query = f"""
            UPDATE users
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING id, email, password, admin, suspended, pinned, created_at
        """
        params.append(user_id)

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            self.conn.commit()
            return cur.fetchone()

    def delete_user(self, user_id):
        query = """
            DELETE FROM users
            WHERE id = %s
            RETURNING id, email, password, admin, suspended, pinned, created_at
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            self.conn.commit()
            return cur.fetchone()

    # =============================================================================
    # NEW METHODS FOR USER MANAGEMENT ACTIONS
    # =============================================================================

    def suspend_user(self, user_id):
        """Suspend a user account"""
        query = """
            UPDATE users
            SET suspended = TRUE
            WHERE id = %s
            RETURNING id, email, password, admin, suspended, pinned, created_at
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            self.conn.commit()
            return cur.fetchone()

    def unsuspend_user(self, user_id):
        """Unsuspend a user account"""
        query = """
            UPDATE users
            SET suspended = FALSE
            WHERE id = %s
            RETURNING id, email, password, admin, suspended, pinned, created_at
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            self.conn.commit()
            return cur.fetchone()

    def pin_user(self, user_id):
        """Pin a user (mark as important)"""
        query = """
            UPDATE users
            SET pinned = TRUE
            WHERE id = %s
            RETURNING id, email, password, admin, suspended, pinned, created_at
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            self.conn.commit()
            return cur.fetchone()

    def unpin_user(self, user_id):
        """Unpin a user"""
        query = """
            UPDATE users
            SET pinned = FALSE
            WHERE id = %s
            RETURNING id, email, password, admin, suspended, pinned, created_at
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            self.conn.commit()
            return cur.fetchone()

    def get_user_stats(self, user_id):
        """Get detailed statistics for a user"""
        query = """
            SELECT
                u.id,
                u.email,
                u.created_at,
                COALESCE(r.total_reports, 0)            AS total_reports,
                COALESCE(r.open_reports, 0)             AS open_reports,
                COALESCE(r.in_progress_reports, 0)      AS in_progress_reports,
                COALESCE(r.resolved_reports, 0)         AS resolved_reports,
                COALESCE(r.denied_reports, 0)           AS denied_reports,
                COALESCE(r.resolved_reports, 0) + COALESCE(r.denied_reports, 0) AS closed_reports,
                COALESCE(pr.pinned_reports_count, 0)    AS pinned_reports_count,
                COALESCE(r.avg_rating_given, 0)         AS avg_rating,
                r.last_report_date                      AS last_report_date
            FROM users u
            LEFT JOIN (
                SELECT
                    created_by,
                    COUNT(*)                                           AS total_reports,
                    COUNT(*) FILTER (WHERE status = 'open')            AS open_reports,
                    COUNT(*) FILTER (WHERE status = 'in_progress')     AS in_progress_reports,
                    COUNT(*) FILTER (WHERE status = 'resolved')        AS resolved_reports,
                    COUNT(*) FILTER (WHERE status = 'denied')          AS denied_reports,
                    AVG(rating)                                        AS avg_rating_given,
                    MAX(created_at)                                    AS last_report_date
                FROM reports
                GROUP BY created_by
            ) r ON r.created_by = u.id
            LEFT JOIN (
                SELECT
                    user_id,
                    COUNT(*) AS pinned_reports_count
                FROM pinned_reports
                GROUP BY user_id
            ) pr ON pr.user_id = u.id
            WHERE u.id = %s;
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            result = cur.fetchone()

            if not result:
                return None

            return {
                "user_id": result[0],
                "email": result[1],
                "created_at": result[2],
                "total_reports": result[3],
                "open_reports": result[4],
                "in_progress_reports": result[5],
                "resolved_reports": result[6],
                "denied_reports": result[7],
                "closed_reports": result[8],  # ¡NUEVO!
                "pinned_reports_count": result[9],
                "avg_rating": float(result[10]) if result[10] else 0,
                "last_report_date": result[11],
            }

    def validate_credentials(self, email, password):
        """Validate user credentials without returning password"""
        query = """
            SELECT id, email, admin, suspended, pinned, created_at
            FROM users
            WHERE email = %s AND password = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (email, password))
            return cur.fetchone()

    def redeem_admin_code_and_promote(self, user_id: int, code: str) -> dict:
        """
        Minimal flow:
        - Look up `code` in admin_codes (you inserted it manually).
        - If found, promote user to admin in that department.
        - No deletion of codes. No expiration. No extra logging.
        """
        code = (code or "").strip()
        if not code:
            raise ValueError("Code cannot be empty")

        with self.conn:
            with self.conn.cursor() as cur:
                # Ensure user exists (and grab current admin flag)
                cur.execute("SELECT admin FROM users WHERE id = %s", (user_id,))
                row = cur.fetchone()
                if not row:
                    raise ValueError("User not found")
                already_admin = bool(row[0])

                # Get department from your manually-inserted code
                cur.execute(
                    "SELECT department FROM admin_codes WHERE code = %s", (code,)
                )
                row = cur.fetchone()
                if not row:
                    raise ValueError("Invalid code")

                department = row[0]
                if department not in VALID_DEPARTMENTS:
                    # Extra guard; administrators table also enforces this via CHECK.
                    raise ValueError("Invalid department for this code")

                # Upsert into administrators (id is the same as users.id)
                cur.execute(
                    """
                    INSERT INTO administrators (id, department)
                    VALUES (%s, %s)
                    ON CONFLICT (id) DO UPDATE
                    SET department = EXCLUDED.department
                    """,
                    (user_id, department),
                )

                # Flip users.admin to TRUE
                cur.execute("UPDATE users SET admin = TRUE WHERE id = %s", (user_id,))

        return {
            "success": True,
            "department": department,
            "already_admin": already_admin,
        }

    def close(self):
        if self.conn:
            self.conn.close()
