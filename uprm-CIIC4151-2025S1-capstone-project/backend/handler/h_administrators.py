from flask import request, jsonify
from dao.d_administrators import AdministratorsDAO
from constants import HTTP_STATUS


class AdministratorsHandler:

    # -------------------------------------------------------
    # MAPPERS
    # -------------------------------------------------------
    def map_to_dict(self, administrator):
        """
        Basic admin info.

        Expected row (a.* only):
        [0] id
        [1] department
        """
        return {
            "id": administrator[0],
            "user_id": administrator[0],   # admin id == user id
            "department": administrator[1],
        }

    def map_to_dict_with_user_info(self, administrator):
        """
        Admin with user info.

        Expected row (a.*, u.email, u.suspended, u.created_at):
        [0] id
        [1] department
        [2] email
        [3] suspended
        [4] user_created_at
        """
        base_dict = {
            "id": administrator[0],
            "user_id": administrator[0],   # admin id == user id
            "department": administrator[1],
        }

        if len(administrator) > 2:
            base_dict["email"] = administrator[2]
        if len(administrator) > 3:
            base_dict["suspended"] = administrator[3]
        if len(administrator) > 4:
            base_dict["user_created_at"] = administrator[4]

        return base_dict

    def map_to_dict_with_stats(self, administrator):
        """
        Admin with stats.

        Expected row from get_all_admin_stats():
            [0] id
            [1] department
            [2] email
            [3] total_assigned_reports
            [4] resolved_reports
            [5] avg_rating
            [6] resolved_personally
        """
        return {
            "id": administrator[0],
            "user_id": administrator[0],   # admin id == user id
            "department": administrator[1],
            "email": administrator[2],
            "total_assigned_reports": administrator[3],
            "resolved_reports": administrator[4],
            "avg_rating": float(administrator[5]) if administrator[5] else 0,
            "resolved_personally": administrator[6],
        }

    # -------------------------------------------------------
    # CRUD
    # -------------------------------------------------------
    def get_all_administrators(self, page=1, limit=10):
        try:
            offset = (page - 1) * limit

            dao = AdministratorsDAO()
            administrators = dao.get_administrators_paginated(limit, offset)
            total_count = dao.get_total_administrator_count()
            total_pages = (total_count + limit - 1) // limit

            administrators_dict_list = [
                self.map_to_dict_with_user_info(admin) for admin in administrators
            ]

            return (
                jsonify(
                    {
                        "administrators": administrators_dict_list,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_administrator_by_id(self, administrator_id):
        try:
            dao = AdministratorsDAO()
            administrator = dao.get_administrator_by_id(administrator_id)

            if not administrator:
                return (
                    jsonify({"error_msg": "Administrator not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            administrator_dict = self.map_to_dict_with_user_info(administrator)
            return jsonify(administrator_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def create_administrator(self, data):
        try:
            if not data:
                return jsonify({"error_msg": "Missing data"}), HTTP_STATUS.BAD_REQUEST

            required_fields = ["user_id", "department"]
            for field in required_fields:
                if field not in data:
                    return (
                        jsonify({"error_msg": f"Missing field: {field}"}),
                        HTTP_STATUS.BAD_REQUEST,
                    )

            user_id = data["user_id"]
            department = data["department"]

            dao = AdministratorsDAO()

            # Validate department
            if not dao.validate_department(department):
                valid_departments = ["DTOP", "LUMA", "AAA", "DDS"]
                return (
                    jsonify(
                        {
                            "error_msg": f"Invalid department. Must be one of: {valid_departments}"
                        }
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            # Check if administrator already exists for this user
            if dao.get_administrator_by_user_id(user_id):
                return (
                    jsonify(
                        {"error_msg": "Administrator already exists for this user"}
                    ),
                    HTTP_STATUS.CONFLICT,
                )

            inserted_administrator = dao.create_administrator(user_id, department)

            if not inserted_administrator:
                return (
                    jsonify({"error_msg": "Administrator not inserted"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            # Get the full administrator info with user details
            full_administrator = dao.get_administrator_by_id(inserted_administrator[0])
            inserted_administrator_dict = self.map_to_dict_with_user_info(
                full_administrator
            )
            return jsonify(inserted_administrator_dict), HTTP_STATUS.CREATED
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def update_administrator(self, administrator_id, data):
        try:
            dao = AdministratorsDAO()

            if not data:
                return jsonify({"error_msg": "Missing data"}), HTTP_STATUS.BAD_REQUEST

            if not dao.get_administrator_by_id(administrator_id):
                return (
                    jsonify({"error_msg": "Administrator not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            department = data.get("department")

            # Validate department if provided
            if department and not dao.validate_department(department):
                valid_departments = ["DTOP", "LUMA", "AAA", "DDS"]
                return (
                    jsonify(
                        {
                            "error_msg": f"Invalid department. Must be one of: {valid_departments}"
                        }
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            updated_administrator = dao.update_administrator(
                administrator_id, department
            )

            if not updated_administrator:
                return (
                    jsonify({"error_msg": "Administrator not updated"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            # Get the full updated administrator info
            full_administrator = dao.get_administrator_by_id(administrator_id)
            updated_administrator_dict = self.map_to_dict_with_user_info(
                full_administrator
            )
            return jsonify(updated_administrator_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def delete_administrator(self, administrator_id):
        try:
            dao = AdministratorsDAO()

            if not dao.get_administrator_by_id(administrator_id):
                return (
                    jsonify({"error_msg": "Administrator not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            success = dao.delete_administrator(administrator_id)

            if not success:
                return (
                    jsonify({"error_msg": "Administrator not deleted"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            return "", HTTP_STATUS.NO_CONTENT
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # -------------------------------------------------------
    # BY DEPARTMENT / DETAILS
    # -------------------------------------------------------
    def get_administrators_by_department(self, department):
        try:
            if not department:
                return (
                    jsonify({"error_msg": "Missing department"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = AdministratorsDAO()

            # Validate department
            if not dao.validate_department(department):
                valid_departments = ["DTOP", "LUMA", "AAA", "DDS"]
                return (
                    jsonify(
                        {
                            "error_msg": f"Invalid department. Must be one of: {valid_departments}"
                        }
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            administrators = dao.get_administrators_by_department(department)
            administrators_dict_list = [
                self.map_to_dict_with_user_info(admin) for admin in administrators
            ]

            return (
                jsonify(
                    {
                        "department": department,
                        "administrators": administrators_dict_list,
                        "count": len(administrators_dict_list),
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_administrator_with_details(self, administrator_id):
        """Get administrator info with department assignment details"""
        try:
            dao = AdministratorsDAO()
            administrator = dao.get_administrator_with_department_details(
                administrator_id
            )

            if not administrator:
                return (
                    jsonify({"error_msg": "Administrator not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            # Expected row:
            # [0] id, [1] department, [2] email, [3] suspended, [4] user_created_at, [5] assigned_department
            admin_dict = self.map_to_dict_with_user_info(administrator)
            if len(administrator) > 5:
                admin_dict["assigned_department"] = administrator[5]

            return jsonify(admin_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_available_administrators(self):
        """Get administrators not currently assigned to any department"""
        try:
            dao = AdministratorsDAO()
            administrators = dao.get_available_administrators()
            administrators_dict_list = [
                self.map_to_dict_with_user_info(admin) for admin in administrators
            ]

            return (
                jsonify(
                    {
                        "administrators": administrators_dict_list,
                        "count": len(administrators_dict_list),
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # -------------------------------------------------------
    # STATS
    # -------------------------------------------------------
    def get_admin_stats(self, admin_id):
        try:
            dao = AdministratorsDAO()

            if not dao.get_administrator_by_id(admin_id):
                return (
                    jsonify({"error_msg": "Administrator not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            stats = dao.get_admin_stats(admin_id)

            # El DAO ahora devuelve el formato correcto, así que solo lo pasamos
            return jsonify(stats), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_all_admin_stats(self):
        """Get statistics for all administrators"""
        try:
            dao = AdministratorsDAO()
            admin_stats = dao.get_all_admin_stats()
            admin_stats_list = [
                self.map_to_dict_with_stats(admin) for admin in admin_stats
            ]

            return (
                jsonify(
                    {"administrators": admin_stats_list, "count": len(admin_stats_list)}
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # -------------------------------------------------------
    # ADMIN INFO FOR FRONTEND (used by /administrators/check/<user_id> or /me/admin)
    # -------------------------------------------------------
    def check_user_is_administrator(self, user_id):
        """
        Return admin flag + department for a given user.
        This uses AdministratorsDAO.get_admin_info_for_user so it matches the
        AdminInfo type in the frontend: { admin, department }.
        """
        try:
            if not user_id:
                return (
                    jsonify({"error_msg": "Missing user_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = AdministratorsDAO()
            info = dao.get_admin_info_for_user(user_id)

            response = {
                "user_id": user_id,
                "admin": info["admin"],
                "department": info["department"],
            }

            return jsonify(response), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # -------------------------------------------------------
    # PERFORMANCE REPORT
    # -------------------------------------------------------
    def get_administrator_performance_report(self):
        """Get performance report for administrators"""
        try:
            days = request.args.get("days", default=30, type=int)

            if days <= 0:
                return (
                    jsonify({"error_msg": "Days must be a positive number"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = AdministratorsDAO()
            performance_data = dao.get_administrator_performance_report(days)

            performance_list = []
            for admin in performance_data:
                performance_list.append(
                    {
                        "id": admin[0],
                        "department": admin[1],
                        "email": admin[2],
                        "reports_handled": admin[3],
                        "reports_resolved": admin[4],
                        "personally_resolved": admin[5],
                        "avg_rating": float(admin[6]) if admin[6] else 0,
                        "categories_handled": admin[7],
                    }
                )

            return (
                jsonify(
                    {
                        "performance_report": performance_list,
                        "period_days": days,
                        "count": len(performance_list),
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # -------------------------------------------------------
    # REPORTS VISIBLE TO ADMIN (DEPARTMENT FILTER)
    # -------------------------------------------------------
    def get_reports_for_admin(self, admin_id):
        """Get reports filtered by the administrator's department"""
        try:
            dao = AdministratorsDAO()

            # First, check if the admin exists
            administrator = dao.get_administrator_by_id(admin_id)
            if not administrator:
                return (
                    jsonify({"error_msg": "Administrator not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            # Fetch reports using the SQL-based department filter
            reports = dao.get_reports_for_admin(admin_id)

            reports_list = []
            for r in reports:
                reports_list.append(
                    {
                        "id": r[0],
                        "title": r[1],
                        "description": r[2],
                        "status": r[3],
                        "category": r[4],
                        "created_by": r[5],
                        "validated_by": r[6],
                        "resolved_by": r[7],
                        "created_at": r[8],
                        "resolved_at": r[9],
                        "location": r[10],
                        "image_url": r[11],
                        "rating": r[12],
                    }
                )

            return (
                jsonify(
                    {
                        "admin_id": admin_id,
                        "department": administrator[1],  # department index
                        "reports": reports_list,
                        "count": len(reports_list),
                    }
                ),
                HTTP_STATUS.OK,
            )

        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR
