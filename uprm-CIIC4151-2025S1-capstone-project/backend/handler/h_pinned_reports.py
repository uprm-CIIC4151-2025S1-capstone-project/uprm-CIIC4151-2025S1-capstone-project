from flask import request, jsonify
from dao.d_pinned_reports import PinnedReportsDAO
from constants import HTTP_STATUS


class PinnedReportsHandler:

    def map_to_dict(self, pinned_report):
        """Map database result to dictionary"""
        # If it's a basic pinned_report (just from pinned_reports table)
        if len(pinned_report) == 3:  # user_id, report_id, pinned_at
            return {
                "user_id": pinned_report[0],
                "id": pinned_report[1],
                "pinned_at": pinned_report[2],
            }
        else:  # If it includes report details from JOIN
            return {
                "user_id": pinned_report[0],
                "id": pinned_report[1],
                "pinned_at": pinned_report[2],
                "title": pinned_report[3] if len(pinned_report) > 3 else None,
                "description": pinned_report[4] if len(pinned_report) > 4 else None,
                "status": pinned_report[5] if len(pinned_report) > 5 else None,
                "category": pinned_report[6] if len(pinned_report) > 6 else None,
                "created_at": pinned_report[7] if len(pinned_report) > 7 else None,
            }

    def pin_report(self, data):
        try:
            if not data:
                return jsonify({"error_msg": "Missing data"}), HTTP_STATUS.BAD_REQUEST

            # Get user_id from request data (required)
            user_id = data.get("user_id")
            if not user_id:
                return (
                    jsonify({"error_msg": "User ID is required"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            try:
                report_id = data["report_id"]
            except KeyError:
                return (
                    jsonify({"error_msg": "Missing field: report_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = PinnedReportsDAO()

            # Check if already pinned
            if dao.get_pinned_report(user_id, report_id):
                return (
                    jsonify({"error_msg": "Report already pinned"}),
                    HTTP_STATUS.CONFLICT,
                )

            pinned_report = dao.pin_report(user_id, report_id)

            if not pinned_report:
                return (
                    jsonify({"error_msg": "Failed to pin report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            pinned_report_dict = self.map_to_dict(pinned_report)
            return jsonify(pinned_report_dict), HTTP_STATUS.CREATED
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def unpin_report(self, user_id, report_id):
        try:
            # Get user_id from request parameters if not provided
            if not user_id:
                user_id = request.args.get("user_id")
                if not user_id:
                    return (
                        jsonify({"error_msg": "Missing user_id parameter"}),
                        HTTP_STATUS.BAD_REQUEST,
                    )

            if not report_id:
                return (
                    jsonify({"error_msg": "Missing report_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = PinnedReportsDAO()

            if not dao.get_pinned_report(user_id, report_id):
                return (
                    jsonify({"error_msg": "Pinned report not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            success = dao.unpin_report(user_id, report_id)

            if not success:
                return (
                    jsonify({"error_msg": "Failed to unpin report"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            return "", HTTP_STATUS.NO_CONTENT
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_pinned_reports(self, user_id=None, page=1, limit=10):
        try:
            offset = (page - 1) * limit
            dao = PinnedReportsDAO()

            if user_id:
                pinned_reports = dao.get_pinned_reports_by_user(user_id, limit, offset)
                total_count = dao.get_pinned_reports_count_by_user(user_id)
            else:
                pinned_reports = dao.get_all_pinned_reports(limit, offset)
                total_count = dao.get_total_pinned_reports_count()

            total_pages = (total_count + limit - 1) // limit

            pinned_reports_dict = [self.map_to_dict(pr) for pr in pinned_reports]

            return (
                jsonify(
                    {
                        "pinned_reports": pinned_reports_dict,
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

    def get_user_pinned_reports(self, user_id, page=1, limit=10):
        try:
            if not user_id:
                return (
                    jsonify({"error_msg": "Missing user_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            return self.get_pinned_reports(user_id, page, limit)
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def check_pinned_status(self, user_id, report_id):
        """Check if a report is pinned by a specific user"""
        try:
            if not user_id or not report_id:
                return (
                    jsonify({"error_msg": "Missing user_id or report_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = PinnedReportsDAO()
            is_pinned = dao.is_report_pinned_by_user(user_id, report_id)

            return (
                jsonify(
                    {"user_id": user_id, "report_id": report_id, "pinned": is_pinned}
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_pinned_report_detail(self, user_id, report_id):
        """Get detailed information about a specific pinned report"""
        try:
            if not user_id or not report_id:
                return (
                    jsonify({"error_msg": "Missing user_id or report_id"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = PinnedReportsDAO()
            pinned_report = dao.get_pinned_report_details(user_id, report_id)

            if not pinned_report:
                return (
                    jsonify({"error_msg": "Pinned report not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            pinned_report_dict = self.map_to_dict(pinned_report)
            return jsonify(pinned_report_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

