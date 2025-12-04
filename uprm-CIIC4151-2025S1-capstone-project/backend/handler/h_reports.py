from flask import jsonify
from dao.d_reports import ReportsDAO
from dao.d_administrators import AdministratorsDAO
from constants import HTTP_STATUS


class ReportsHandler:
    # -----------------------------------
    # Helpers for admin-based restrictions
    # -----------------------------------
    @staticmethod
    def _department_allowed_categories(department: str | None):
        """
        Map a department name to the categories it is allowed to see.
        Return None or [] to indicate 'no restriction'.
        """
        if not department:
            return None

        dept = department.strip().upper()

        if dept == "LUMA":
            return ["street_light", "traffic_signal", "electrical_hazard"]
        if dept == "DTOP":
            return ["pothole", "road_damage", "fallen_tree"]
        if dept == "AAA":
            return ["flooding", "water_outage", "pipe_leak"]
        if dept == "DDS":
            return ["sanitation", "wandering_waste", "sinkhole"]

        # Unknown department → no restriction
        return None

    def _get_allowed_categories_for_admin(self, admin_id: int | None):
        """
        Given an admin_id (which is the same as user_id in your schema),
        fetch the administrator row and derive which categories they are
        allowed to see.

        If admin_id is None or the user is not an administrator,
        this returns None (no restriction).
        """
        if not admin_id:
            return None

        admin_dao = AdministratorsDAO()
        info = admin_dao.get_admin_info_for_user(admin_id)

        if not info or not info.get("admin"):
            # Not an administrator → no restriction
            return None

        # Your existing code assumes:
        # 0: id, 1: user_id, 2: department, 3+: user fields...
        department = info.get("department")
        return self._department_allowed_categories(department)

    # -----------------------------------
    # Existing mapping logic
    # -----------------------------------
    def map_to_dict(self, report):
        return {
            "id": report[0],
            "title": report[1],
            "description": report[2],
            "status": report[3],
            "category": report[4],
            "created_by": report[5],
            "validated_by": report[6],
            "resolved_by": report[7],
            "created_at": report[8],
            "resolved_at": report[9],
            "location": report[10],
            "image_url": report[11],
            "rating": report[12],
        }

    # -----------------------------------
    # GET /reports  (with optional admin_id)
    # -----------------------------------
    def get_all_reports(self, page=1, limit=10, sort=None, admin_id=None):
        try:
            offset = (page - 1) * limit
            dao = ReportsDAO()

            allowed_categories = self._get_allowed_categories_for_admin(admin_id)

            reports = dao.get_reports_paginated(
                limit,
                offset,
                sort=sort,
                allowed_categories=allowed_categories,
            )
            total_count = dao.get_total_report_count(
                allowed_categories=allowed_categories
            )
            total_pages = (total_count + limit - 1) // limit
            reports_dict_list = [self.map_to_dict(report) for report in reports]
            return (
                jsonify(
                    {
                        "reports": reports_dict_list,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_report_by_id(self, report_id):
        try:
            dao = ReportsDAO()
            report = dao.get_report_by_id(report_id)
            if not report:
                return jsonify({"error_msg": "Report not found"}), HTTP_STATUS.NOT_FOUND
            return jsonify(self.map_to_dict(report)), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def create_report(self, data):
        try:
            title = data.get("title")
            description = data.get("description")
            category = data.get("category", "other")
            location_id = data.get("location_id")
            image_url = data.get("image_url")
            created_by = data.get("user_id")

            if not title or not description:
                return (
                    jsonify({"error_msg": "Title and description are required"}),
                    HTTP_STATUS.BAD_REQUEST,
                )
            if not created_by:
                return (
                    jsonify({"error_msg": "User ID is required"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            valid_categories = [
                "pothole",
                "street_light",
                "traffic_signal",
                "road_damage",
                "sanitation",
                "sinkhole",
                "electrical_hazard",
                "wandering_waste",
                "flooding",
                "pipe_leak",
                "fallen_tree",
                "water_outage",
                "other",
            ]
            if category not in valid_categories:
                return (
                    jsonify(
                        {
                            "error_msg": f"Invalid category. Must be one of: {valid_categories}"
                        }
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = ReportsDAO()
            inserted_report = dao.create_report(
                title=title,
                description=description,
                category=category,
                location_id=location_id,
                image_url=image_url,
                created_by=created_by,
            )
            if not inserted_report:
                return (
                    jsonify({"error_msg": "Failed to create report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )
            return jsonify(self.map_to_dict(inserted_report)), HTTP_STATUS.CREATED
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def update_report(self, report_id, data):
        try:
            dao = ReportsDAO()
            if not data:
                return (
                    jsonify({"error_msg": "Missing request data"}),
                    HTTP_STATUS.BAD_REQUEST,
                )
            if not dao.get_report_by_id(report_id):
                return jsonify({"error_msg": "Report not found"}), HTTP_STATUS.NOT_FOUND

            status = data.get("status")
            rating = data.get("rating")
            title = data.get("title")
            description = data.get("description")
            category = data.get("category")
            validated_by = data.get("validated_by")
            resolved_by = data.get("resolved_by")
            resolved_at = data.get("resolved_at")
            location_id = data.get("location_id")
            image_url = data.get("image_url")

            if status and status not in [
                "resolved",
                "denied",
                "in_progress",
                "open",
                "closed",
            ]:
                return jsonify({"error_msg": "Invalid status"}), HTTP_STATUS.BAD_REQUEST
            if category and category not in [
                "pothole",
                "street_light",
                "traffic_signal",
                "road_damage",
                "sanitation",
                "sinkhole",
                "electrical_hazard",
                "wandering_waste",
                "water_outage",
                "flooding",
                "pipe_leak",
                "fallen_tree",
                "other",
            ]:
                return (
                    jsonify({"error_msg": "Invalid category"}),
                    HTTP_STATUS.BAD_REQUEST,
                )
            if rating and (rating < 1 or rating > 5):
                return (
                    jsonify({"error_msg": "Rating must be between 1 and 5"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            updated_report = dao.update_report(
                report_id=report_id,
                status=status,
                rating=rating,
                title=title,
                description=description,
                category=category,
                validated_by=validated_by,
                resolved_by=resolved_by,
                resolved_at=resolved_at,
                location_id=location_id,
                image_url=image_url,
            )
            if not updated_report:
                return (
                    jsonify({"error_msg": "Failed to update report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )
            return jsonify(self.map_to_dict(updated_report)), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def delete_report(self, report_id):
        try:
            dao = ReportsDAO()
            if not dao.get_report_by_id(report_id):
                return jsonify({"error_msg": "Report not found"}), HTTP_STATUS.NOT_FOUND
            success = dao.delete_report(report_id)
            if not success:
                return (
                    jsonify({"error_msg": "Failed to delete report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )
            return "", HTTP_STATUS.NO_CONTENT
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # ---------- UNIFIED ENTRY POINT ----------
    # /reports/search?q=&status=&category=&sort=&admin_id=
    def search_reports(
        self,
        query=None,
        page=1,
        limit=10,
        status=None,
        category=None,
        sort=None,
        admin_id=None,  # 👈 NEW
    ):
        """
        Handles:
        - search only      (/reports/search?q=...)
        - filter only      (/reports/search?status=... [&category=...] [&sort=asc|desc])
        - search + filter  (/reports/search?q=...&status=... [&category=...] [&sort=...])
        - AND applies backend admin category restriction if admin_id is provided.
        """
        try:
            q = (query or "").strip()
            s = (status or "").strip()
            c = (category or "").strip()
            order = (sort or "").strip().lower()  # 'asc' or 'desc'

            if not q and not s and not c:
                return (
                    jsonify(
                        {"error_msg": "Provide at least one of: q, status, category"}
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            if s and s not in ["resolved", "denied", "in_progress", "open", "closed"]:
                return jsonify({"error_msg": "Invalid status"}), HTTP_STATUS.BAD_REQUEST

            if c and c not in [
                "pothole",
                "street_light",
                "traffic_signal",
                "road_damage",
                "sanitation",
                "flooding",
                "water_outage",
                "wandering_waste",
                "electrical_hazard",
                "sinkhole",
                "fallen_tree",
                "pipe_leak",
                "other",
            ]:
                return (
                    jsonify({"error_msg": "Invalid category"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            offset = (page - 1) * limit
            dao = ReportsDAO()

            # 🔹 Admin-based restriction
            allowed_categories = self._get_allowed_categories_for_admin(admin_id)

            rows, total_count = dao.search_reports(
                q=q if q else None,
                status=s if s else None,
                category=c if c else None,
                limit=limit,
                offset=offset,
                sort=order if order in ("asc", "desc") else None,
                allowed_categories=allowed_categories,  # 👈 pass restriction
            )

            total_pages = (total_count + limit - 1) // limit
            reports = [self.map_to_dict(r) for r in rows]

            return (
                jsonify(
                    {
                        "reports": reports,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                        "query": q or None,
                        "status": s or None,
                        "category": c or None,
                        "sort": (order if order in ("asc", "desc") else "desc"),
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # Backward-compat: /reports/filter → delegates to search_reports (now with admin)
    def filter_reports(self, status, category, page=1, limit=10, sort=None, admin_id=None):
        return self.search_reports(
            query=None,
            page=page,
            limit=limit,
            status=status,
            category=category,
            sort=sort,
            admin_id=admin_id,
        )

    def get_reports_by_user(self, user_id, page=1, limit=10):
        try:
            offset = (page - 1) * limit
            dao = ReportsDAO()
            reports = dao.get_reports_by_user(user_id, limit, offset)
            total_count = dao.get_user_reports_count(user_id)
            total_pages = (total_count + limit - 1) // limit
            reports_dict_list = [self.map_to_dict(report) for report in reports]
            return (
                jsonify(
                    {
                        "reports": reports_dict_list,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                        "user_id": user_id,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def validate_report(self, report_id, data):
        try:
            dao = ReportsDAO()
            if not dao.get_report_by_id(report_id):
                return jsonify({"error_msg": "Report not found"}), HTTP_STATUS.NOT_FOUND
            try:
                admin_id = data["admin_id"]
            except KeyError:
                return (
                    jsonify({"error_msg": "Missing admin_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )
            updated_report = dao.update_report(
                report_id=report_id, validated_by=admin_id, status="in_progress"
            )
            if not updated_report:
                return (
                    jsonify({"error_msg": "Failed to validate report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )
            return jsonify(self.map_to_dict(updated_report)), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def resolve_report(self, report_id, data):
        try:
            dao = ReportsDAO()
            if not dao.get_report_by_id(report_id):
                return jsonify({"error_msg": "Report not found"}), HTTP_STATUS.NOT_FOUND
            try:
                admin_id = data["admin_id"]
            except KeyError:
                return (
                    jsonify({"error_msg": "Missing admin_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )
            updated_report = dao.update_report(
                report_id=report_id,
                resolved_by=admin_id,
                status="resolved",
                resolved_at="NOW()",
            )
            if not updated_report:
                return (
                    jsonify({"error_msg": "Failed to resolve report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )
            return jsonify(self.map_to_dict(updated_report)), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def rate_report(self, report_id, data):
        try:
            dao = ReportsDAO()
            if not dao.get_report_by_id(report_id):
                return jsonify({"error_msg": "Report not found"}), HTTP_STATUS.NOT_FOUND
            try:
                rating = data["rating"]
            except KeyError:
                return jsonify({"error_msg": "Missing rating"}), HTTP_STATUS.BAD_REQUEST
            if rating < 1 or rating > 5:
                return (
                    jsonify({"error_msg": "Rating must be between 1 and 5"}),
                    HTTP_STATUS.BAD_REQUEST,
                )
            updated_report = dao.update_report(report_id=report_id, rating=rating)
            if not updated_report:
                return (
                    jsonify({"error_msg": "Failed to rate report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )
            return jsonify(self.map_to_dict(updated_report)), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_report_rating_status(self, report_id, user_id):
        """Check if a user has rated a specific report"""
        try:
            if not user_id:
                return (
                    jsonify({"error_msg": "Missing user_id parameter"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = ReportsDAO()
            rating_status = dao.get_user_rating_status(report_id, user_id)

            return (
                jsonify(
                    {
                        "rated": rating_status["rated"],
                        "rating": rating_status["rating"],
                        "user_id": user_id,
                        "report_id": report_id,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_report_rating(self, report_id):
        """Get overall rating statistics for a report"""
        try:
            dao = ReportsDAO()
            rating_stats = dao.get_report_rating_stats(report_id)

            return (
                jsonify(
                    {
                        "report_id": report_id,
                        "average_rating": rating_stats["average_rating"],
                        "total_ratings": rating_stats["total_ratings"],
                        "rating_distribution": rating_stats["distribution"],
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def change_report_status(self, report_id, data):
        """Generic status change for admins"""
        try:
            if not data:
                return jsonify({"error_msg": "Missing data"}), HTTP_STATUS.BAD_REQUEST

            status = data.get("status")
            admin_id = data.get("admin_id")

            if not status or not admin_id:
                return (
                    jsonify({"error_msg": "Missing status or admin_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            valid_statuses = ["open", "in_progress", "resolved", "denied", "closed"]
            if status not in valid_statuses:
                return (
                    jsonify(
                        {
                            "error_msg": f"Invalid status. Must be one of: {valid_statuses}"
                        }
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = ReportsDAO()

            if not dao.get_report_by_id(report_id):
                return (
                    jsonify({"error_msg": "Report not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            # Update report status
            update_data = {"status": status}
            if status == "resolved":
                update_data["resolved_by"] = admin_id
                update_data["resolved_at"] = "NOW()"
            elif status == "in_progress":
                update_data["validated_by"] = admin_id

            updated_report = dao.update_report(report_id, **update_data)

            if not updated_report:
                return (
                    jsonify({"error_msg": "Failed to update report status"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            return jsonify(self.map_to_dict(updated_report)), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_status_options(self):
        """Get available status options for admin UI"""
        try:
            status_options = [
                {
                    "value": "open",
                    "label": "Open",
                    "description": "New report awaiting validation",
                },
                {
                    "value": "in_progress",
                    "label": "In Progress",
                    "description": "Report validated and being worked on",
                },
                {
                    "value": "resolved",
                    "label": "Resolved",
                    "description": "Report has been resolved",
                },
                {
                    "value": "denied",
                    "label": "Denied",
                    "description": "Report was rejected",
                },
                {
                    "value": "closed",
                    "label": "Closed",
                    "description": "Report completed and closed",
                },
            ]

            return jsonify({"status_options": status_options}), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_overview_stats(self):
        try:
            dao = ReportsDAO()
            stats = dao.get_overview_stats()
            return jsonify(stats), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_department_stats(self, department):
        try:
            dao = ReportsDAO()
            stats = dao.get_department_stats(department)
            if not stats:
                return (
                    jsonify({"error_msg": "Department not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )
            return jsonify(stats), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_admin_dashboard(self):
        try:
            dao = ReportsDAO()
            dashboard_data = dao.get_admin_dashboard()
            return jsonify(dashboard_data), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_pending_reports(self, page=1, limit=10):
        try:
            offset = (page - 1) * limit
            dao = ReportsDAO()
            reports = dao.get_pending_reports(limit, offset)
            total_count = dao.get_pending_reports_count()
            total_pages = (total_count + limit - 1) // limit
            reports_dict_list = [self.map_to_dict(report) for report in reports]
            return (
                jsonify(
                    {
                        "reports": reports_dict_list,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_assigned_reports(self, admin_id, page=1, limit=10):
        try:
            offset = (page - 1) * limit
            dao = ReportsDAO()
            reports = dao.get_assigned_reports(admin_id, limit, offset)
            total_count = dao.get_assigned_reports_count(admin_id)
            total_pages = (total_count + limit - 1) // limit
            reports_dict_list = [self.map_to_dict(report) for report in reports]
            return (
                jsonify(
                    {
                        "reports": reports_dict_list,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                        "admin_id": admin_id,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR
