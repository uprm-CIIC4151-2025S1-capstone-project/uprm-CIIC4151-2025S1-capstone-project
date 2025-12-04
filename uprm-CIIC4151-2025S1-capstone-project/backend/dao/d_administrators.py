from dotenv import load_dotenv
from load import load_db


class AdministratorsDAO:
    def __init__(self):
        load_dotenv()
        self.conn = load_db()

    # -------------------------------------------------------
    # BASIC QUERIES
    # -------------------------------------------------------
    def get_administrators_paginated(self, limit, offset):
        """
        Row shape:
        [0] a.id
        [1] a.department
        [2] u.email
        [3] u.suspended
        [4] user_created_at
        """
        query = """
            SELECT a.*, u.email, u.suspended, u.created_at AS user_created_at
            FROM administrators a
            JOIN users u ON a.id = u.id
            ORDER BY a.id
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            return cur.fetchall()

    def get_total_administrator_count(self):
        query = "SELECT COUNT(*) FROM administrators"
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchone()[0]

    def get_all_administrators(self):
        """
        Same row shape as get_administrators_paginated.
        """
        query = """
            SELECT a.*, u.email, u.suspended, u.created_at AS user_created_at
            FROM administrators a
            JOIN users u ON a.id = u.id
            ORDER BY a.id
        """
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    def get_administrator_by_id(self, administrator_id):
        """
        Same row shape as get_administrators_paginated.
        """
        query = """
            SELECT a.*, u.email, u.suspended, u.created_at AS user_created_at
            FROM administrators a
            JOIN users u ON a.id = u.id
            WHERE a.id = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (administrator_id,))
            return cur.fetchone()

    def get_administrator_by_user_id(self, user_id):
        """
        admin id == user id, so this is effectively the same as get_administrator_by_id.
        """
        query = """
            SELECT a.*, u.email, u.suspended, u.created_at AS user_created_at
            FROM administrators a
            JOIN users u ON a.id = u.id
            WHERE a.id = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone()

    def create_administrator(self, user_id, department):
        """
        administrators table: (id, department)
        """
        query = """
            INSERT INTO administrators (id, department)
            VALUES (%s, %s)
            RETURNING *
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id, department))
            self.conn.commit()
            return cur.fetchone()

    def update_administrator(self, administrator_id, department=None):
        # Build dynamic query based on provided fields
        fields = []
        params = []

        if department is not None:
            fields.append("department = %s")
            params.append(department)

        if not fields:
            return None

        query = f"""
            UPDATE administrators
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING *
        """
        params.append(administrator_id)

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            self.conn.commit()
            return cur.fetchone()

    def delete_administrator(self, administrator_id):
        query = "DELETE FROM administrators WHERE id = %s RETURNING *"
        with self.conn.cursor() as cur:
            cur.execute(query, (administrator_id,))
            self.conn.commit()
            result = cur.fetchone()
            return result is not None

    # -------------------------------------------------------
    # BY DEPARTMENT / DETAILS
    # -------------------------------------------------------
    def get_administrators_by_department(self, department):
        """
        Same row shape as get_administrators_paginated.
        """
        query = """
            SELECT a.*, u.email, u.suspended, u.created_at AS user_created_at
            FROM administrators a
            JOIN users u ON a.id = u.id
            WHERE a.department = %s
            ORDER BY a.id
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (department,))
            return cur.fetchall()

    def get_administrator_with_department_details(self, administrator_id):
        """
        Row shape:
        [0] a.id
        [1] a.department
        [2] u.email
        [3] u.suspended
        [4] user_created_at
        [5] assigned_department (from department_admins.da.department, may be NULL)
        """
        query = """
            SELECT
                a.*,
                u.email,
                u.suspended,
                u.created_at AS user_created_at,
                da.department AS assigned_department
            FROM administrators a
            JOIN users u ON a.id = u.id
            LEFT JOIN department_admins da ON a.id = da.admin_id
            WHERE a.id = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (administrator_id,))
            return cur.fetchone()

    def get_available_administrators(self):
        """
        Same row shape as get_administrators_paginated.
        """
        query = """
            SELECT a.*, u.email, u.suspended, u.created_at AS user_created_at
            FROM administrators a
            JOIN users u ON a.id = u.id
            WHERE a.id NOT IN (
                SELECT admin_id FROM department_admins WHERE admin_id IS NOT NULL
            )
            ORDER BY a.id
        """
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    # -------------------------------------------------------
    # STATS
    # -------------------------------------------------------
    def get_admin_stats(self, admin_id):
        """
        Returns a dict already shaped for JSON, used directly by handler.
        """
        query = """
            SELECT
                COUNT(r.id) AS total_assigned_reports,
                COUNT(CASE WHEN r.status = 'in_progress' THEN 1 END) AS in_progress_reports,
                COUNT(CASE WHEN r.resolved_by = a.id THEN 1 END) AS resolved_personally
            FROM administrators a
            LEFT JOIN reports r
                ON (r.validated_by = a.id OR r.resolved_by = a.id)
            WHERE a.id = %s
            GROUP BY a.id
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (admin_id,))
            result = cur.fetchone()

            if not result:
                return {
                    "total_assigned_reports": 0,
                    "in_progress_reports": 0,
                    "resolved_personally": 0
                }

            return {
                "total_assigned_reports": result[0] or 0,
                "in_progress_reports": result[1] or 0,
                "resolved_personally": result[2] or 0,
            }

    def get_all_admin_stats(self):
        """
        Row shape for each admin:
        [0] a.id
        [1] a.department
        [2] u.email
        [3] total_assigned_reports
        [4] resolved_reports
        [5] avg_rating
        [6] personally_resolved
        """
        query = """
            SELECT
                a.id,
                a.department,
                u.email,
                COUNT(r.id) AS total_assigned_reports,
                COUNT(CASE WHEN r.status = 'resolved' THEN 1 END) AS resolved_reports,
                COALESCE(AVG(r.rating), 0) AS avg_rating,
                COUNT(CASE WHEN r.resolved_by = a.id THEN 1 END) AS resolved_personally
            FROM administrators a
            JOIN users u ON a.id = u.id
            LEFT JOIN reports r
                ON (r.validated_by = a.id OR r.resolved_by = a.id)
            GROUP BY a.id, a.department, u.email
            ORDER BY total_assigned_reports DESC
        """
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    # -------------------------------------------------------
    # VALIDATION / SIMPLE CHECKS
    # -------------------------------------------------------
    def validate_department(self, department):
        """Validate if department is in the allowed list"""
        valid_departments = ["DTOP", "LUMA", "AAA", "DDS"]
        return department in valid_departments

    def is_user_administrator(self, user_id):
        """Check if a user is an administrator (admin id == user id)"""
        query = "SELECT 1 FROM administrators WHERE id = %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone() is not None

    # -------------------------------------------------------
    # ADMIN INFO FOR FRONTEND (/me/admin or check_user_is_administrator)
    # -------------------------------------------------------
    def get_admin_info_for_user(self, user_id):
        """
        Returns whether the user is admin and their department.
        Uses users.admin + administrators.department.

        Row shape:
        [0] u.admin
        [1] a.department (can be NULL if not in administrators)
        """
        query = """
            SELECT u.admin, a.department
            FROM users u
            LEFT JOIN administrators a ON u.id = a.id
            WHERE u.id = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()

            if not row:
                # User not found → treat as non-admin
                return {"admin": False, "department": None}

            is_admin, department = row
            return {
                "admin": bool(is_admin),
                "department": department,
            }

    # -------------------------------------------------------
    # PERFORMANCE REPORT
    # -------------------------------------------------------
    def get_administrator_performance_report(self, days=30):
        """
        Row shape:
        [0] a.id
        [1] a.department
        [2] u.email
        [3] reports_handled
        [4] reports_resolved
        [5] personally_resolved
        [6] avg_rating
        [7] categories_handled
        """
        query = """
            SELECT
                a.id,
                a.department,
                u.email,
                COUNT(r.id) AS reports_handled,
                COUNT(CASE WHEN r.status = 'resolved' THEN 1 END) AS reports_resolved,
                COUNT(CASE WHEN r.resolved_by = a.id THEN 1 END) AS personally_resolved,
                COALESCE(AVG(r.rating), 0) AS avg_rating,
                COUNT(DISTINCT r.category) AS categories_handled
            FROM administrators a
            JOIN users u ON a.id = u.id
            LEFT JOIN reports r
                ON (r.validated_by = a.id OR r.resolved_by = a.id)
            WHERE r.created_at >= CURRENT_DATE - (%s * INTERVAL '1 day')
            GROUP BY a.id, a.department, u.email
            ORDER BY reports_handled DESC
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (days,))
            return cur.fetchall()

    # -------------------------------------------------------
    # REPORTS VISIBLE TO ADMIN (DEPARTMENT → CATEGORIES)
    # -------------------------------------------------------
    def get_reports_for_admin(self, admin_id):
        """
        Return all reports visible to this admin, based on their department.

        Department → allowed categories mapping:
        LUMA: street_light, traffic_signal, electrical_hazard
        DTOP: pothole, road_damage, fallen_tree
        AAA:  flooding, water_outage, pipe_leak
        DDS:  sanitation, wandering_waste, sinkhole

        Row shape from reports r.*:
        [0] id
        [1] title
        [2] description
        [3] status
        [4] category
        [5] created_by
        [6] validated_by
        [7] resolved_by
        [8] created_at
        [9] resolved_at
        [10] location
        [11] image_url
        [12] rating
        """
        sql = """
            SELECT r.*
            FROM reports r
            JOIN administrators a ON a.id = %s
            WHERE (
                (a.department = 'LUMA'
                 AND r.category IN ('street_light', 'traffic_signal', 'electrical_hazard'))
             OR (a.department = 'DTOP'
                 AND r.category IN ('pothole', 'road_damage', 'fallen_tree'))
             OR (a.department = 'AAA'
                 AND r.category IN ('flooding', 'water_outage', 'pipe_leak'))
             OR (a.department = 'DDS'
                 AND r.category IN ('sanitation', 'wandering_waste', 'sinkhole'))
            )
            ORDER BY r.created_at DESC
        """
        with self.conn.cursor() as cur:
            cur.execute(sql, (admin_id,))
            return cur.fetchall()

    # -------------------------------------------------------
    # CLEANUP
    # -------------------------------------------------------
    def close(self):
        if self.conn:
            self.conn.close()
